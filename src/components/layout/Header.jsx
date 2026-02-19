import React from 'react';
import { Search, Settings, Plus, Download, Menu } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Header = ({
    activeSheet,
    searchTerm,
    onSearchChange,
    onOpenSettings,
    onExportClick,
    onAddNewRow,
    onToggleSidebar
}) => {
    return (
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 relative">
            <div className="flex items-center gap-3 sm:gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <Menu size={20} />
                </button>

                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 truncate max-w-[150px] sm:max-w-none">
                    <span className="truncate">{activeSheet.name}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-xs font-normal border border-slate-200 hidden sm:inline-block">
                        {activeSheet.data.length} registros
                    </span>
                </h2>
                <Button
                    variant="ghost"
                    onClick={onOpenSettings}
                    title="Configurações da Lista"
                    className="hidden sm:flex"
                >
                    <Settings size={18} />
                </Button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative hidden xs:block">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar..."
                        className="pl-9 pr-4 py-2 w-32 sm:w-48 md:w-64"
                    />
                </div>
                <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
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
                    <span className="hidden sm:inline">Novo Item</span>
                </Button>
            </div>
        </header>
    );
};

export default Header;
