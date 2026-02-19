import React, { useRef } from 'react';
import { Layout, Upload, Plus, Table as TableIcon, X } from 'lucide-react';
import Button from '../ui/Button';

const Sidebar = ({
    sheets,
    activeSheetId,
    setActiveSheetId,
    onCreateSheet,
    onDeleteSheet,
    onImportCSV,
    isOpen,
    onClose
}) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onImportCSV(file);
        }
        // Clear the input so the same file can be selected again
        event.target.value = null;
    };

    const sidebarClasses = `
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col shadow-lg transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `;

    return (
        <>
            {/* Backdrop for mobile */}
            {
                isOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                        onClick={onClose}
                    />
                )
            }

            <aside className={sidebarClasses}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv"
                    className="hidden"
                />

                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-600 rounded-lg text-white">
                            <Layout size={20} />
                        </div>
                        <span className="font-bold text-lg tracking-tight">StaffGrid</span>
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-3">
                    <Button
                        variant="dark"
                        onClick={() => {
                            fileInputRef.current.click();
                            onClose(); // Close sidebar on mobile action
                        }}
                        className="w-full justify-center mb-2"
                    >
                        <Upload size={16} />
                        Importar CSV
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            onCreateSheet();
                            onClose();
                        }}
                        className="w-full justify-center"
                    >
                        <Plus size={16} />
                        Nova Lista
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 mt-2">Suas Listas</div>
                    {sheets.map(sheet => (
                        <div
                            key={sheet.id}
                            onClick={() => {
                                setActiveSheetId(sheet.id);
                                onClose();
                            }}
                            className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${activeSheetId === sheet.id
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100'
                                }`}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <TableIcon size={16} className={activeSheetId === sheet.id ? 'text-emerald-500' : 'text-slate-400'} />
                                <span className="truncate text-sm font-medium">{sheet.name}</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm("Excluir esta lista permanentemente?")) {
                                        onDeleteSheet(sheet.id);
                                    }
                                }}
                                className={`p-1 rounded hover:bg-white hover:text-rose-500 hover:shadow-sm opacity-0 group-hover:opacity-100 transition-all ${activeSheetId === sheet.id ? 'text-emerald-400' : 'text-slate-300'
                                    }`}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
                    {sheets.length} listas ativas
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
