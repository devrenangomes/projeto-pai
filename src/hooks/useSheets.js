import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { processCSV } from '../utils/csvParser';

export const useSheets = (session) => {
    const [sheets, setSheets] = useState([]);
    const [activeSheetId, setActiveSheetId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    // Fetch initial data
    useEffect(() => {
        if (session?.user) {
            fetchSheets();
        } else {
            setSheets([]);
            setIsLoading(false);
        }
    }, [session]);

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
                // If no sheets, create default for the user
                await createEmptySheet('Lista Inicial');
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            // Don't alert on 401/403, just empty state if needed, but here we expect success
        } finally {
            setIsLoading(false);
        }
    };

    const activeSheet = useMemo(() =>
        sheets.find(s => s.id === activeSheetId) || (sheets.length > 0 ? sheets[0] : null)
        , [sheets, activeSheetId]);

    // Sheets CRUD
    const createEmptySheet = async (nameOrEvent = 'Nova Lista') => {
        if (!session?.user) return;

        const name = (typeof nameOrEvent === 'string') ? nameOrEvent : 'Nova Lista';

        try {
            const newSheet = {
                name: name,
                columns: ['Coluna A', 'Coluna B', 'Coluna C'],
                user_id: session.user.id
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
            // And we will iterate and update.

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

    // ── CSV: read file and parse (does NOT save to DB) ───────────────────────
    const parseCSVFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const parsed = processCSV(text, file.name);
                    if (!parsed || !parsed.columns || parsed.columns.length === 0) {
                        reject(new Error('Arquivo inválido ou vazio.'));
                    } else {
                        resolve(parsed);
                    }
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Erro ao ler arquivo.'));
            reader.readAsText(file);
        });
    };

    // ── CSV: create a NEW sheet from a parsed CSV object ─────────────────────
    const importCSV = async (parsed) => {
        if (!session?.user) return;
        setIsLoading(true);
        try {
            const { data: sheetData, error: sheetError } = await supabase
                .from('sheets')
                .insert([{
                    name: parsed.name,
                    columns: parsed.columns,
                    user_id: session.user.id
                }])
                .select()
                .single();

            if (sheetError) throw sheetError;

            const rowsToInsert = parsed.data.map(row => {
                const { id, ...rowData } = row;
                return { sheet_id: sheetData.id, data: rowData };
            });

            const { data: rowsData, error: rowsError } = await supabase
                .from('rows')
                .insert(rowsToInsert)
                .select();

            if (rowsError) throw rowsError;

            const formattedRows = rowsData.map(r => ({ id: r.id, ...r.data }));
            const newSheet = { ...sheetData, data: formattedRows };

            setSheets(prev => [...prev, newSheet]);
            setActiveSheetId(sheetData.id);
        } catch (error) {
            console.error('CSV Import Error:', error);
            alert(`Erro ao importar CSV: ${error.message || JSON.stringify(error)}`);
        } finally {
            setIsLoading(false);
        }
    };

    // ── CSV: APPEND rows from a parsed CSV into an existing sheet ─────────────
    // Maps columns case-insensitively; ignores CSV columns not in target sheet.
    const appendCSVToSheet = async (targetSheetId, csvRows) => {
        if (!session?.user) return;

        const targetSheet = sheets.find(s => s.id === targetSheetId);
        if (!targetSheet) {
            alert('Lista de destino não encontrada.');
            return;
        }

        setIsLoading(true);
        try {
            const rowsToInsert = csvRows.map(csvRow => {
                const rowData = {};
                targetSheet.columns.forEach(col => {
                    // Case-insensitive key lookup
                    const matchedKey = Object.keys(csvRow).find(
                        k => k.toLowerCase() === col.toLowerCase()
                    );
                    rowData[col] = matchedKey ? (csvRow[matchedKey] ?? '') : '';
                });
                return { sheet_id: targetSheetId, data: rowData };
            });

            if (rowsToInsert.length === 0) {
                alert('Nenhuma linha para adicionar.');
                return;
            }

            const { data: rowsData, error: rowsError } = await supabase
                .from('rows')
                .insert(rowsToInsert)
                .select();

            if (rowsError) throw rowsError;

            const formattedRows = rowsData.map(r => ({ id: r.id, ...r.data }));

            setSheets(prev => prev.map(sheet =>
                sheet.id === targetSheetId
                    ? { ...sheet, data: [...sheet.data, ...formattedRows] }
                    : sheet
            ));
            setActiveSheetId(targetSheetId);
        } catch (error) {
            console.error('Append CSV Error:', error);
            alert(`Erro ao adicionar linhas: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };


    // Import from AI (Gemini image extraction) — creates a NEW sheet
    const importFromAI = async (name, columns, rows) => {
        if (!session?.user) return;

        setIsLoading(true);
        try {
            // 1. Create the sheet with AI-detected columns
            const { data: sheetData, error: sheetError } = await supabase
                .from('sheets')
                .insert([{
                    name,
                    columns,
                    user_id: session.user.id
                }])
                .select()
                .single();

            if (sheetError) throw sheetError;

            // 2. Prepare rows for bulk insert
            const rowsToInsert = rows.map(row => {
                const rowData = {};
                columns.forEach(col => {
                    rowData[col] = row[col] ?? '';
                });
                return { sheet_id: sheetData.id, data: rowData };
            });

            // 3. Bulk insert (only if there are rows)
            let formattedRows = [];
            if (rowsToInsert.length > 0) {
                const { data: rowsData, error: rowsError } = await supabase
                    .from('rows')
                    .insert(rowsToInsert)
                    .select();

                if (rowsError) throw rowsError;
                formattedRows = rowsData.map(r => ({ id: r.id, ...r.data }));
            }

            // 4. Update local state
            const newSheet = { ...sheetData, data: formattedRows };
            setSheets(prev => [...prev, newSheet]);
            setActiveSheetId(sheetData.id);

        } catch (error) {
            console.error('AI Import Error:', error);
            alert(`Erro ao importar lista da IA: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Append rows extracted by AI to an EXISTING sheet
    const appendRowsToSheet = async (targetSheetId, rows) => {
        if (!session?.user) return;

        const targetSheet = sheets.find(s => s.id === targetSheetId);
        if (!targetSheet) {
            alert('Lista de destino não encontrada.');
            return;
        }

        setIsLoading(true);
        try {
            // Prepare rows using the TARGET sheet's existing columns
            const rowsToInsert = rows.map(row => {
                const rowData = {};
                targetSheet.columns.forEach(col => {
                    // Try exact match first, then case-insensitive
                    const matchedKey = Object.keys(row).find(
                        k => k.toLowerCase() === col.toLowerCase()
                    );
                    rowData[col] = matchedKey ? (row[matchedKey] ?? '') : '';
                });
                return { sheet_id: targetSheetId, data: rowData };
            });

            if (rowsToInsert.length === 0) {
                alert('Nenhuma linha para adicionar.');
                return;
            }

            const { data: rowsData, error: rowsError } = await supabase
                .from('rows')
                .insert(rowsToInsert)
                .select();

            if (rowsError) throw rowsError;

            const formattedRows = rowsData.map(r => ({ id: r.id, ...r.data }));

            // Update local state by appending new rows to the existing sheet
            setSheets(prev => prev.map(sheet => {
                if (sheet.id === targetSheetId) {
                    return { ...sheet, data: [...sheet.data, ...formattedRows] };
                }
                return sheet;
            }));
            setActiveSheetId(targetSheetId);

        } catch (error) {
            console.error('Append Rows Error:', error);
            alert(`Erro ao adicionar linhas à lista: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Merge Lists: copy rows from source sheets into the active sheet
    const mergeLists = async (sourceSheetIds) => {
        if (!activeSheet || sourceSheetIds.length === 0) return;

        setIsLoading(true);
        try {
            const targetColumns = activeSheet.columns;

            // Collect rows from each source sheet (already in local state)
            const rowsToInsert = [];
            for (const sourceId of sourceSheetIds) {
                const sourceSheet = sheets.find(s => s.id === sourceId);
                if (!sourceSheet) continue;

                sourceSheet.data.forEach(row => {
                    // Normalize: map source values to target columns by exact name match;
                    // missing columns are filled with empty string.
                    const rowData = {};
                    targetColumns.forEach(col => {
                        rowData[col] = row[col] ?? '';
                    });
                    rowsToInsert.push({ sheet_id: activeSheet.id, data: rowData });
                });
            }

            if (rowsToInsert.length === 0) {
                alert('Nenhuma linha encontrada nas listas de origem.');
                return;
            }

            // Bulk insert
            const { data: insertedRows, error } = await supabase
                .from('rows')
                .insert(rowsToInsert)
                .select();

            if (error) throw error;

            const formattedRows = insertedRows.map(r => ({ id: r.id, ...r.data }));

            // Update local state
            setSheets(prev => prev.map(sheet => {
                if (sheet.id === activeSheet.id) {
                    return { ...sheet, data: [...sheet.data, ...formattedRows] };
                }
                return sheet;
            }));

        } catch (error) {
            console.error('Merge Error:', error);
            alert(`Erro ao mesclar listas: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        sheets,
        activeSheet,
        activeSheetId,
        setActiveSheetId,
        createEmptySheet,
        deleteSheet,
        parseCSVFile,
        importCSV,
        appendCSVToSheet,
        importFromAI,
        appendRowsToSheet,
        updateSheetSettings,
        addNewRow,
        deleteRow,
        editingId,
        setEditingId,
        editFormData,
        setEditFormData,
        startEditing,
        saveEdit,
        mergeLists,
        isLoading
    };
};
