import React, { useState, useMemo } from 'react';
import { GitMerge, X, Check, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

/**
 * MergeListModal
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - sheets: Sheet[]       – all available sheets
 *  - activeSheet: Sheet    – the destination sheet (cannot be a source)
 *  - onMerge: (sourceIds: string[]) => Promise<void>
 */
const MergeListModal = ({ isOpen, onClose, sheets, activeSheet, onMerge }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [isMerging, setIsMerging] = useState(false);

    // Sheets the user can pick from (everything except the active one)
    const availableSheets = useMemo(
        () => sheets.filter(s => s.id !== activeSheet?.id),
        [sheets, activeSheet]
    );

    // Total rows that would be imported
    const totalRows = useMemo(
        () => availableSheets
            .filter(s => selectedIds.includes(s.id))
            .reduce((acc, s) => acc + (s.data?.length ?? 0), 0),
        [availableSheets, selectedIds]
    );

    const toggleSheet = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleMerge = async () => {
        if (selectedIds.length === 0) return;
        setIsMerging(true);
        try {
            await onMerge(selectedIds);
            setSelectedIds([]);
            onClose();
        } finally {
            setIsMerging(false);
        }
    };

    const handleClose = () => {
        if (isMerging) return;
        setSelectedIds([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-slate-50 shrink-0">
                    <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                        <GitMerge size={20} className="text-emerald-600" />
                        Mesclar Listas
                    </h3>
                    <button
                        onClick={handleClose}
                        disabled={isMerging}
                        className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4 overflow-y-auto flex-1">

                    {/* Destination info */}
                    <div className="text-sm text-slate-600 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                        <span className="font-medium text-emerald-700">Destino: </span>
                        {activeSheet?.name}
                        <p className="text-xs text-emerald-600 mt-0.5">
                            As linhas das listas selecionadas serão copiadas para esta lista.
                        </p>
                    </div>

                    {/* Source selection */}
                    {availableSheets.length === 0 ? (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p className="text-sm">
                                Você precisa ter ao menos duas listas para usar esta funcionalidade.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-700">
                                Selecione as listas de origem:
                            </p>
                            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                                {availableSheets.map(sheet => {
                                    const isChecked = selectedIds.includes(sheet.id);
                                    return (
                                        <label
                                            key={sheet.id}
                                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${isChecked
                                                    ? 'bg-emerald-50'
                                                    : 'hover:bg-slate-50'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleSheet(sheet.id)}
                                                className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-700 truncate">
                                                    {sheet.name}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {sheet.data?.length ?? 0} registro(s)
                                                </p>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Row count preview */}
                    {selectedIds.length > 0 && (
                        <p className="text-sm text-slate-500 text-center">
                            <span className="font-semibold text-slate-700">{totalRows}</span> registro(s) serão adicionados à lista "{activeSheet?.name}"
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-slate-50 flex justify-end gap-3 shrink-0">
                    <Button variant="ghost" onClick={handleClose} disabled={isMerging}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleMerge}
                        disabled={selectedIds.length === 0 || isMerging || availableSheets.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isMerging ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Mesclando...
                            </>
                        ) : (
                            <>
                                <Check size={16} />
                                Mesclar ({totalRows} registros)
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MergeListModal;
