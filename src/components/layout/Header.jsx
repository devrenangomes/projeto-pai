import React from 'react';
import { Search, Settings, Plus, Download } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Header = ({
    activeSheet,
    searchTerm,
    onSearchChange,
    onOpenSettings,
    onExportClick,
    onAddNewRow
}) => {
    return (
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    {activeSheet.name}
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-xs font-normal border border-slate-200">
                        {activeSheet.data.length} registros
                    </span>
                </h2>
                <Button
                    variant="ghost"
                    onClick={onOpenSettings}
                    title="Configurações da Lista (Colunas e Nome)"
                >
                    <Settings size={18} />
                </Button>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar na lista atual..."
                        className="pl-9 pr-4 py-2 w-64"
                    />
                </div>
                <div className="h-6 w-px bg-slate-200 mx-1"></div>
                <Button
                    variant="ghost"
                    onClick={onExportClick}
                    title="Exportar Dados"
                >
                    <Download size={18} />
                </Button>
                <Button
                    variant="primary"
                    onClick={onAddNewRow}
                >
                    <Plus size={16} />
                    Novo Item
                </Button>
            </div>
        </header>
    );
};

export default Header;
