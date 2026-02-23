import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Check, X, Loader2, Sparkles, AlertCircle, PlusCircle, FolderInput } from 'lucide-react';
import Button from '../ui/Button';
import { processImageWithGemini } from '../../services/gemini';

/**
 * ImageImporter
 *
 * Props:
 *  - onComplete(mode, payload)
 *      mode === 'new'      → payload = { listName, columns, rows }
 *      mode === 'append'   → payload = { targetSheetId, rows }
 *  - onCancel()
 *  - sheets: Array of existing sheets [{ id, name, columns }]
 */
export const ImageImporter = ({ onComplete, onCancel, sheets = [] }) => {
    const [image, setImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);
    const [listName, setListName] = useState('');
    const [error, setError] = useState(null);

    // Mode: 'new' | 'append'
    const [importMode, setImportMode] = useState('new');
    const [targetSheetId, setTargetSheetId] = useState(sheets[0]?.id ?? '');

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(URL.createObjectURL(file));
            processImage(file);
        }
    };

    const processImage = async (file) => {
        setIsProcessing(true);
        setError(null);
        setColumns([]);
        setRows([]);
        try {
            const data = await processImageWithGemini(file);
            setColumns(data.columns);
            setRows(data.rows);
            setListName(`Lista IA (${data.rows.length} registros)`);
        } catch (err) {
            console.error("Erro no processamento:", err);
            setError(err.message || "Erro ao processar imagem. Tente novamente.");
            setImage(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCellChange = (rowIndex, col, value) => {
        const newRows = [...rows];
        newRows[rowIndex] = { ...newRows[rowIndex], [col]: value };
        setRows(newRows);
    };

    const handleDeleteRow = (index) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    const handleConfirm = () => {
        if (importMode === 'new') {
            if (!listName.trim()) return;
            onComplete('new', { listName: listName.trim(), columns, rows });
        } else {
            if (!targetSheetId) return;
            onComplete('append', { targetSheetId, rows });
        }
    };

    const handleReset = () => {
        setImage(null);
        setColumns([]);
        setRows([]);
        setListName('');
        setError(null);
    };

    const hasResults = image && !isProcessing && columns.length > 0;
    const canConfirm = rows.length > 0 && (
        importMode === 'new' ? listName.trim() !== '' : targetSheetId !== ''
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-slate-50 shrink-0">
                    <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                        <Sparkles size={20} className="text-purple-600" />
                        Leitura Inteligente (IA)
                    </h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">

                    {/* Upload buttons */}
                    {!image && (
                        <div className="grid grid-cols-2 gap-4 h-48">
                            <button
                                onClick={() => cameraInputRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-slate-500 hover:text-purple-600"
                            >
                                <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                                    <Camera size={24} />
                                </div>
                                <span className="font-medium">Tirar Foto</span>
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-slate-500 hover:text-blue-600"
                            >
                                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                    <ImageIcon size={24} />
                                </div>
                                <span className="font-medium">Galeria</span>
                            </button>

                            <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} className="hidden" onChange={handleFileSelect} />
                            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sm">Erro ao processar imagem</p>
                                <p className="text-sm mt-0.5">{error}</p>
                                <button onClick={handleReset} className="mt-2 text-xs underline hover:text-rose-900">Tentar novamente</button>
                            </div>
                        </div>
                    )}

                    {/* Processing spinner */}
                    {image && isProcessing && (
                        <div className="text-center py-14 space-y-5">
                            <div className="relative mx-auto w-20 h-20">
                                <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                                <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
                                <Sparkles className="absolute inset-0 m-auto text-purple-500 animate-pulse" size={28} />
                            </div>
                            <div>
                                <h4 className="text-base font-semibold text-slate-800">Analisando imagem...</h4>
                                <p className="text-slate-500 text-sm mt-1">A IA está identificando os dados da imagem.</p>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {hasResults && (
                        <div className="space-y-4">

                            {/* ── Mode Selector ── */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Destino da importação</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* New list option */}
                                    <button
                                        onClick={() => setImportMode('new')}
                                        className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all text-sm font-medium ${importMode === 'new'
                                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <PlusCircle size={18} className={importMode === 'new' ? 'text-purple-600' : 'text-slate-400'} />
                                        Criar nova lista
                                    </button>

                                    {/* Existing list option */}
                                    <button
                                        onClick={() => setImportMode('append')}
                                        disabled={sheets.length === 0}
                                        className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed ${importMode === 'append'
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <FolderInput size={18} className={importMode === 'append' ? 'text-blue-600' : 'text-slate-400'} />
                                        Adicionar à lista existente
                                    </button>
                                </div>
                            </div>

                            {/* ── New list: name input ── */}
                            {importMode === 'new' && (
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome da nova lista</label>
                                        <input
                                            type="text"
                                            value={listName}
                                            onChange={(e) => setListName(e.target.value)}
                                            placeholder="Ex: Funcionários Jan/2026"
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div className="text-right pt-5">
                                        <button onClick={handleReset} className="text-xs text-blue-600 hover:underline">Nova Foto</button>
                                    </div>
                                </div>
                            )}

                            {/* ── Append: existing list dropdown ── */}
                            {importMode === 'append' && (
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Selecionar lista existente</label>
                                        <select
                                            value={targetSheetId}
                                            onChange={(e) => setTargetSheetId(e.target.value)}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            {sheets.map(sheet => (
                                                <option key={sheet.id} value={sheet.id}>{sheet.name}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-slate-400 mt-1">
                                            As colunas da lista selecionada serão usadas. Dados não mapeados serão ignorados.
                                        </p>
                                    </div>
                                    <div className="text-right pt-5">
                                        <button onClick={handleReset} className="text-xs text-blue-600 hover:underline">Nova Foto</button>
                                    </div>
                                </div>
                            )}

                            {/* Table preview */}
                            <div className="border rounded-lg overflow-auto bg-white shadow-sm max-h-64">
                                <table className="w-full text-sm text-left min-w-max">
                                    <thead className="bg-slate-50 text-slate-500 border-b sticky top-0">
                                        <tr>
                                            {columns.map((col) => (
                                                <th key={col} className="px-3 py-2 font-medium whitespace-nowrap">{col}</th>
                                            ))}
                                            <th className="px-2 py-2 w-8" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {rows.map((row, rowIndex) => (
                                            <tr key={rowIndex} className="hover:bg-slate-50 group">
                                                {columns.map((col) => (
                                                    <td key={col} className="p-1.5">
                                                        <input
                                                            type="text"
                                                            value={row[col] ?? ''}
                                                            onChange={(e) => handleCellChange(rowIndex, col, e.target.value)}
                                                            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none px-1 py-0.5 text-slate-700 min-w-[80px]"
                                                        />
                                                    </td>
                                                ))}
                                                <td className="p-1.5 text-center">
                                                    <button
                                                        onClick={() => handleDeleteRow(rowIndex)}
                                                        className="text-slate-300 hover:text-rose-500 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {rows.length === 0 && (
                                            <tr>
                                                <td colSpan={columns.length + 1} className="p-8 text-center text-slate-400 italic">
                                                    Nenhum dado identificado. Tente outra foto.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <p className="text-xs text-slate-400">
                                {rows.length} registro(s) identificado(s) · {columns.length} coluna(s). Você pode editar os dados antes de confirmar.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {hasResults && (
                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-3 shrink-0">
                        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!canConfirm}
                            className={`gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed ${importMode === 'new'
                                    ? 'bg-purple-600 hover:bg-purple-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            <Check size={18} />
                            {importMode === 'new'
                                ? `Criar Lista (${rows.length} registros)`
                                : `Adicionar à lista (${rows.length} registros)`
                            }
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
