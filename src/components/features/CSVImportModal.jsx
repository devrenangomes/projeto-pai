import React, { useState, useMemo } from 'react';
import { FileSpreadsheet, PlusCircle, FolderInput, Check, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Button from '../ui/Button';

/**
 * CSVImportModal
 *
 * Props:
 *  - parsed: { name, columns, data } — resultado do processCSV
 *  - sheets: array de listas existentes [{ id, name, columns }]
 *  - onConfirm(mode, payload)
 *      mode === 'new'    → payload = { name, parsed }
 *      mode === 'append' → payload = { targetSheetId, rows }
 *  - onCancel()
 */
const CSVImportModal = ({ parsed, sheets, onConfirm, onCancel }) => {
    const [mode, setMode] = useState('new');
    const [newName, setNewName] = useState(parsed?.name ?? 'Nova Lista');
    const [targetSheetId, setTargetSheetId] = useState(sheets[0]?.id ?? '');

    const rows = parsed?.data ?? [];
    const csvColumns = parsed?.columns ?? [];

    // ── Compatibility analysis ────────────────────────────────────────────────
    const compatibility = useMemo(() => {
        if (!targetSheetId || mode !== 'append') return null;

        const targetSheet = sheets.find(s => s.id === targetSheetId);
        if (!targetSheet) return null;

        const targetCols = targetSheet.columns ?? [];
        const csvColsLower = csvColumns.map(c => c.toLowerCase());
        const targetColsLower = targetCols.map(c => c.toLowerCase());

        // Matched: column exists in both (case-insensitive)
        const matched = targetCols.filter(tc =>
            csvColsLower.includes(tc.toLowerCase())
        );
        // Ignored: CSV columns that don't exist in target
        const ignored = csvColumns.filter(cc =>
            !targetColsLower.includes(cc.toLowerCase())
        );
        // Empty: target columns that don't exist in CSV
        const empty = targetCols.filter(tc =>
            !csvColsLower.includes(tc.toLowerCase())
        );

        const score = matched.length / Math.max(targetCols.length, 1);

        return { matched, ignored, empty, score, targetSheet };
    }, [targetSheetId, mode, sheets, csvColumns]);

    const canConfirm =
        rows.length > 0 &&
        (mode === 'new'
            ? newName.trim() !== ''
            : targetSheetId !== '' && (compatibility?.matched?.length ?? 0) > 0);

    const handleConfirm = () => {
        if (mode === 'new') {
            onConfirm('new', { name: newName.trim(), parsed });
        } else {
            onConfirm('append', { targetSheetId, rows });
        }
    };

    // Preview: first 3 rows
    const previewRows = rows.slice(0, 3);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-slate-50 shrink-0">
                    <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                        <FileSpreadsheet size={20} className="text-emerald-600" />
                        Importar CSV
                        <span className="text-sm font-normal text-slate-400 truncate max-w-[200px]">
                            · {parsed?.name}
                        </span>
                    </h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">

                    {/* ── Summary badge ── */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <Info size={16} className="text-slate-400 shrink-0" />
                        <span className="text-sm text-slate-600">
                            <strong>{rows.length}</strong> linha(s) · <strong>{csvColumns.length}</strong> coluna(s) detectadas
                        </span>
                    </div>

                    {/* ── CSV column list ── */}
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Colunas do arquivo</p>
                        <div className="flex flex-wrap gap-2">
                            {csvColumns.map(col => (
                                <span key={col} className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded text-xs font-medium">
                                    {col}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ── Mini preview table ── */}
                    {previewRows.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Prévia ({previewRows.length} de {rows.length} linhas)
                            </p>
                            <div className="border rounded-lg overflow-auto max-h-36 bg-white shadow-sm">
                                <table className="w-full text-xs text-left min-w-max">
                                    <thead className="bg-slate-50 text-slate-500 border-b sticky top-0">
                                        <tr>
                                            {csvColumns.map(col => (
                                                <th key={col} className="px-3 py-2 font-medium whitespace-nowrap">{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {previewRows.map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                {csvColumns.map(col => (
                                                    <td key={col} className="px-3 py-1.5 text-slate-600 whitespace-nowrap">
                                                        {row[col] ?? ''}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Mode selector ── */}
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Destino</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setMode('new')}
                                className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all text-sm font-medium ${mode === 'new'
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <PlusCircle size={18} className={mode === 'new' ? 'text-emerald-600' : 'text-slate-400'} />
                                Criar nova lista
                            </button>

                            <button
                                onClick={() => setMode('append')}
                                disabled={sheets.length === 0}
                                className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed ${mode === 'append'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <FolderInput size={18} className={mode === 'append' ? 'text-blue-600' : 'text-slate-400'} />
                                Adicionar à lista existente
                            </button>
                        </div>
                    </div>

                    {/* ── New list: name input ── */}
                    {mode === 'new' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome da nova lista</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="Ex: Funcionários Jan/2026"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    )}

                    {/* ── Append: select + compatibility analysis ── */}
                    {mode === 'append' && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Selecionar lista de destino</label>
                                <select
                                    value={targetSheetId}
                                    onChange={e => setTargetSheetId(e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    {sheets.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Compatibility report */}
                            {compatibility && (
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-slate-50 px-4 py-2 border-b flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Análise de compatibilidade</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${compatibility.score === 1
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : compatibility.score >= 0.5
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-rose-100 text-rose-700'
                                            }`}>
                                            {Math.round(compatibility.score * 100)}% compatível
                                        </span>
                                    </div>

                                    <div className="p-3 space-y-2.5">
                                        {/* Matched */}
                                        {compatibility.matched.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-emerald-600 mb-1 flex items-center gap-1.5">
                                                    <CheckCircle size={13} /> {compatibility.matched.length} coluna(s) compatível(s) — serão importadas
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {compatibility.matched.map(c => (
                                                        <span key={c} className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-xs">{c}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Ignored */}
                                        {compatibility.ignored.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-amber-600 mb-1 flex items-center gap-1.5">
                                                    <AlertTriangle size={13} /> {compatibility.ignored.length} coluna(s) do CSV serão <strong>ignoradas</strong> (não existem na lista)
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {compatibility.ignored.map(c => (
                                                        <span key={c} className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded text-xs line-through">{c}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Empty */}
                                        {compatibility.empty.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                                                    <Info size={13} /> {compatibility.empty.length} coluna(s) da lista ficarão <strong>em branco</strong> nessas linhas
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {compatibility.empty.map(c => (
                                                        <span key={c} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded text-xs">{c}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* No match at all */}
                                        {compatibility.matched.length === 0 && (
                                            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
                                                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-semibold">Nenhuma coluna compatível</p>
                                                    <p className="text-xs mt-0.5">As colunas do CSV não correspondem às colunas desta lista. Os dados não poderão ser adicionados.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-slate-50 flex justify-end gap-3 shrink-0">
                    <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        className={`gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'new'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        <Check size={18} />
                        {mode === 'new'
                            ? `Criar Lista (${rows.length} linhas)`
                            : `Adicionar à lista (${rows.length} linhas)`
                        }
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CSVImportModal;
