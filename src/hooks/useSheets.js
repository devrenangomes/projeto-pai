import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { processCSV } from '../utils/csvParser';

export const useSheets = () => {
    const [sheets, setSheets] = useState([]);
    const [activeSheetId, setActiveSheetId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    // Fetch initial data
    useEffect(() => {
        fetchSheets();
    }, []);

    const fetchSheets = async () => {
        setIsLoading(true);
        try {
            // Get all sheets
            const { data: sheetsData, error: sheetsError } = await supabase
                .from('sheets')
                .select('*')
                .order('created_at', { ascending: true });

            if (sheetsError) throw sheetsError;

            // For each sheet, get its rows
            // Note: In a larger app, we might fetch rows only for the active sheet.
            // But to keep the "all in memory" feel for now, let's fetch everything or optimize later.
            // Optimization: Let's fetch rows for ALL sheets to maintain current architecture simplicity
            // or better, let's just fetch everything joined? Supabase JS handles this.

            // Actually, fetching rows for all sheets might be heavy. 
            // Let's modify the architecture slightly: 
            // 1. Fetch Sheets Metadata
            // 2. Fetch Rows for ALL sheets (since client-side filtering/switching is fast)
            // Or better: Let's join them.

            const { data: rowsData, error: rowsError } = await supabase
                .from('rows')
                .select('*');

            if (rowsError) throw rowsError;

            // Merge data
            const fullSheets = sheetsData.map(sheet => {
                const sheetRows = rowsData
                    .filter(r => r.sheet_id === sheet.id)
                    .map(r => ({ id: r.id, ...r.data })); // Flatten JSONB data
                return { ...sheet, data: sheetRows };
            });

            if (fullSheets.length > 0) {
                setSheets(fullSheets);
                if (!activeSheetId) setActiveSheetId(fullSheets[0].id);
            } else {
                // If no sheets, create default? Or leave empty?
                // Let's Create Default if empty
                await createEmptySheet('Lista Inicial');
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Erro ao carregar dados do servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const activeSheet = useMemo(() =>
        sheets.find(s => s.id === activeSheetId) || (sheets.length > 0 ? sheets[0] : null)
        , [sheets, activeSheetId]);

    // Sheets CRUD
    const createEmptySheet = async (nameOrEvent = 'Nova Lista') => {
        const name = (typeof nameOrEvent === 'string') ? nameOrEvent : 'Nova Lista';

        try {
            const newSheet = {
                name: name,
                columns: ['Coluna A', 'Coluna B', 'Coluna C']
            };

            const { data, error } = await supabase
                .from('sheets')
                .insert([newSheet])
                .select()
                .single();

            if (error) throw error;

            const createdSheet = { ...data, data: [] };
            setSheets(prev => [...prev, createdSheet]);
            setActiveSheetId(createdSheet.id);
            return createdSheet;
        } catch (error) {
            console.error('Error creating sheet:', error);
            alert('Erro ao criar nova lista.');
        }
    };

    const deleteSheet = async (id) => {
        if (sheets.length <= 1) {
            alert("Você não pode excluir a única lista.");
            return false;
        }

        try {
            const { error } = await supabase
                .from('sheets')
                .delete()
                .eq('id', id);

            if (error) throw error;

            const newSheets = sheets.filter(s => s.id !== id);
            setSheets(newSheets);
            if (activeSheetId === id) setActiveSheetId(newSheets[0].id);
            return true;
        } catch (error) {
            console.error('Error deleting sheet:', error);
            alert('Erro ao excluir lista.');
            return false;
        }
    };

    // Rows CRUD
    const addNewRow = async () => {
        if (!activeSheet) return;

        const newRowData = {};
        activeSheet.columns.forEach(col => newRowData[col] = '');

        try {
            const { data, error } = await supabase
                .from('rows')
                .insert([{
                    sheet_id: activeSheet.id,
                    data: newRowData
                }])
                .select()
                .single();

            if (error) throw error;

            const createdRow = { id: data.id, ...data.data };

            setSheets(prev => prev.map(sheet => {
                if (sheet.id === activeSheet.id) {
                    return { ...sheet, data: [createdRow, ...sheet.data] };
                }
                return sheet;
            }));

            setEditingId(createdRow.id);
            setEditFormData(createdRow);

        } catch (error) {
            console.error('Error adding row:', error);
            alert('Erro ao adicionar linha.');
        }
    };

    const deleteRow = async (rowId) => {
        if (window.confirm('Remover esta linha?')) {
            try {
                const { error } = await supabase
                    .from('rows')
                    .delete()
                    .eq('id', rowId);

                if (error) throw error;

                setSheets(prev => prev.map(sheet => {
                    if (sheet.id === activeSheetId) {
                        return {
                            ...sheet,
                            data: sheet.data.filter(row => row.id !== rowId)
                        };
                    }
                    return sheet;
                }));
            } catch (error) {
                console.error('Error deleting row:', error);
                alert('Erro ao excluir linha.');
            }
        }
    };

    // Editing
    const startEditing = (row) => {
        setEditingId(row.id);
        setEditFormData({ ...row });
    };

    const saveEdit = async () => {
        if (!editingId || !activeSheet) return;

        try {
            // Remove ID from data to be saved in JSONB column
            const { id, ...dataToSave } = editFormData;

            const { error } = await supabase
                .from('rows')
                .update({ data: dataToSave })
                .eq('id', editingId);

            if (error) throw error;

            setSheets(prev => prev.map(sheet => {
                if (sheet.id === activeSheetId) {
                    return {
                        ...sheet,
                        data: sheet.data.map(row => row.id === editingId ? editFormData : row)
                    };
                }
                return sheet;
            }));

            setEditingId(null);
        } catch (error) {
            console.error('Error saving edit:', error);
            alert('Erro ao salvar alterações.');
        }
    };

    // Settings / Columns Update
    const updateSheetSettings = async (settings) => {
        if (!activeSheet) return;

        try {
            const newColumns = settings.columns.map(c => c.current);

            // 1. Update Sheet Metadata (Name & Columns)
            const { error: sheetError } = await supabase
                .from('sheets')
                .update({ name: settings.name, columns: newColumns })
                .eq('id', activeSheet.id);

            if (sheetError) throw sheetError;

            // 2. We need to update ALL rows data to match new keys?
            // This is complex in NoSQL/JSONB. We have to map the old keys to new keys in every row object.
            // Ideally should be done in backend function, but let's try client side for now.

            // Get current rows
            const currentRows = activeSheet.data;

            // Prepare updates
            // Optimize: Update only changed rows? Or just update all locally and background save?
            // "Background save" of 1000 rows might kill the network.
            // Strategy: We will update the LOCAL state immediately.
            // And we will trigger individual row updates? Too slow.
            // Better Strategy: If we change a column name, we should run a SQL script? No user access.
            // We have to iterate and update.

            // This is the downside of JSONB for columns.
            // Let's do a bulk update if possible or just update the local state and warn user?
            // Or simpler: We just update the 'sheets' definition. The 'data' JSONB keys inside 'rows'
            // will still have old keys.
            // WHEN WE LOAD, we might miss data if keys don't match.
            // FIX: In `fetchSheets` or `render`, we map data based on position? No, JSON is unordered.
            // WE MUST update the row keys.

            const updates = currentRows.map(row => {
                const newRowData = {};
                settings.columns.forEach(col => {
                    if (col.original) {
                        newRowData[col.current] = row[col.original];
                    } else {
                        newRowData[col.current] = '';
                    }
                });
                return { id: row.id, data: newRowData };
            });

            // Perform updates in parallel (batching would be better)
            await Promise.all(updates.map(u =>
                supabase.from('rows').update({ data: u.data }).eq('id', u.id)
            ));

            // Update Local State
            const updatedSheets = sheets.map(sheet => {
                if (sheet.id === activeSheetId) {
                    const newData = updates.map(u => ({ id: u.id, ...u.data }));
                    return {
                        ...sheet,
                        name: settings.name,
                        columns: newColumns,
                        data: newData
                    };
                }
                return sheet;
            });
            setSheets(updatedSheets);

        } catch (error) {
            console.error('Error updating settings:', error);
            alert('Erro ao atualizar configurações.');
        }
    };

    // Import CSV
    const importCSV = (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                const parsed = processCSV(text, file.name);

                if (!parsed || !parsed.columns || parsed.columns.length === 0) {
                    alert('Arquivo inválido ou vazio.');
                    return;
                }

                setIsLoading(true);

                // 1. Create Sheet with correct columns
                const { data: sheetData, error: sheetError } = await supabase
                    .from('sheets')
                    .insert([{
                        name: parsed.name,
                        columns: parsed.columns
                    }])
                    .select()
                    .single();

                if (sheetError) throw sheetError;

                // 2. Prepare Rows for Bulk Insert
                const rowsToInsert = parsed.data.map(row => {
                    // Remove the temp ID from parser, Supabase generates its own
                    const { id, ...rowData } = row;
                    return {
                        sheet_id: sheetData.id,
                        data: rowData
                    };
                });

                // 3. Bulk Insert
                const { data: rowsData, error: rowsError } = await supabase
                    .from('rows')
                    .insert(rowsToInsert)
                    .select();

                if (rowsError) throw rowsError;

                // 4. Update Local State
                const formattedRows = rowsData.map(r => ({ id: r.id, ...r.data }));

                const newSheetComplete = {
                    ...sheetData,
                    data: formattedRows
                };

                setSheets(prev => [...prev, newSheetComplete]);
                setActiveSheetId(sheetData.id);
                alert(`Lista "${parsed.name}" importada com sucesso!`);

            } catch (error) {
                console.error('CSV Import Error:', error);
                alert(`Erro ao importar CSV: ${error.message || JSON.stringify(error)}`);
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsText(file);
    };

    return {
        sheets,
        activeSheet,
        activeSheetId,
        setActiveSheetId,
        createEmptySheet,
        deleteSheet,
        importCSV,
        updateSheetSettings,
        addNewRow,
        deleteRow,
        editingId,
        setEditingId,
        editFormData,
        setEditFormData,
        startEditing,
        saveEdit,
        isLoading
    };
};
