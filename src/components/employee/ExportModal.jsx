
import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Table } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const THEMES = [
    { id: 'clean', name: 'Clean', color: 'bg-slate-200 border-slate-300' },
    { id: 'professional', name: 'Profissional', color: 'bg-sky-500 border-sky-600' },
    { id: 'modern', name: 'Moderno', color: 'bg-emerald-500 border-emerald-600' },
    { id: 'vibrant', name: 'Vibrante', color: 'bg-violet-500 border-violet-600' }
];

const ExportModal = ({ isOpen, onClose, onExport, activeSheetName }) => {
    const [format, setFormat] = useState('xlsx');
    const [theme, setTheme] = useState('clean');

    const handleExport = () => {
        onExport(format, theme);
        onClose();
    };

    const title = (
        <span className="flex items-center gap-2">
            <Download size={20} className="text-emerald-600" />
            Exportar Dados
        </span>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-6">

                {/* Format Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Formato do Arquivo</label>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setFormat('xlsx')}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${format === 'xlsx'
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <FileSpreadsheet size={24} className="mb-2" />
                            <span className="text-sm font-medium">Excel</span>
                        </button>

                        <button
                            onClick={() => setFormat('pdf')}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${format === 'pdf'
                                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <FileText size={24} className="mb-2" />
                            <span className="text-sm font-medium">PDF</span>
                        </button>

                        <button
                            onClick={() => setFormat('csv')}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${format === 'csv'
                                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <Table size={24} className="mb-2" />
                            <span className="text-sm font-medium">CSV</span>
                        </button>
                    </div>
                </div>

                {/* Theme Selection - Only for PDF */}
                {format === 'pdf' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <label className="block text-sm font-medium text-slate-700 mb-3">Estilo Visual (PDF)</label>
                        <div className="grid grid-cols-2 gap-3">
                            {THEMES.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${theme === t.id
                                            ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-500/20'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full shadow-sm shrink-0 ${t.color}`}></div>
                                    <span className={`text-sm font-medium ${theme === t.id ? 'text-emerald-900' : 'text-slate-600'}`}>
                                        {t.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Info Box */}
                <div className="text-xs text-slate-400 text-center px-4">
                    Exportando <strong>{activeSheetName}</strong>.
                    {format === 'csv' && " O formato CSV não suporta estilos visuais."}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleExport}>
                        <Download size={16} />
                        Baixar Arquivo
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ExportModal;
