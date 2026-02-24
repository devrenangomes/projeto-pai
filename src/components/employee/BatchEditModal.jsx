import React, { useState } from 'react';
import { X, Check, Save } from 'lucide-react';

const BatchEditModal = ({ isOpen, onClose, columns, onSave, selectedCount }) => {
    // Stores the column -> new value mapping
    const [edits, setEdits] = useState({});

    // Keep track of which columns user wants to overwrite
    const [activeFields, setActiveFields] = useState({});

    if (!isOpen) return null;

    const toggleField = (col) => {
        setActiveFields(prev => {
            const next = { ...prev };
            if (next[col]) {
                delete next[col];
                setEdits(prevEdits => {
                    const newEdits = { ...prevEdits };
                    delete newEdits[col];
                    return newEdits;
                });
            } else {
                next[col] = true;
                setEdits(prevEdits => ({ ...prevEdits, [col]: '' }));
            }
            return next;
        });
    };

    const handleSave = () => {
        if (Object.keys(edits).length === 0) {
            alert('Nenhuma alteração definida.');
            return;
        }
        onSave(edits);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">Edição em Lote</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Alterando {selectedCount} {selectedCount === 1 ? 'linha' : 'linhas'} selecionadas.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    <p className="text-sm text-slate-600 mb-4">
                        Selecione as colunas que deseja substituir e informe os novos valores:
                    </p>

                    <div className="space-y-3">
                        {columns.map(col => (
                            <div key={col} className="flex flex-col gap-2 p-3 border border-slate-100 rounded-lg">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!activeFields[col]}
                                        onChange={() => toggleField(col)}
                                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                    />
                                    <span className="font-medium text-slate-700">{col}</span>
                                </label>

                                {activeFields[col] && (
                                    <div className="mt-1 pl-6">
                                        <input
                                            type="text"
                                            value={edits[col] || ''}
                                            onChange={(e) => setEdits({ ...edits, [col]: e.target.value })}
                                            placeholder={`Novo valor para ${col}...`}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm font-medium"
                    >
                        <Check size={18} />
                        Aplicar a {selectedCount} {selectedCount === 1 ? 'linha' : 'linhas'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default BatchEditModal;
