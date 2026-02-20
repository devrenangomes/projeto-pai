import React from 'react';
import { Search, Settings, Plus, Download, Menu, Camera } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Header = ({
    activeSheet,
    searchTerm,
    onSearchChange,
    onOpenSettings,
    onExportClick,
    onAddNewRow,
    onToggleSidebar,
    onMenuClick,
    onCameraClick
}) => {
    const handleMenuClick = onToggleSidebar || onMenuClick;

    return (
        <header className="bg-white border-b border-slate-200 flex flex-col sm:h-16 sm:flex-row sm:items-center sm:justify-between shrink-0 z-10 relative">
            
            {/* Top row (always top on mobile, left on desktop) */}
            <div className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-auto w-full sm:w-auto">
                
                {/* Left Side: Burger & Title */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <button
                        onClick={handleMenuClick}
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

                {/* Mobile Right: Actions (Hidden on Desktop) */}
                <div className="flex items-center gap-1 sm:hidden">
                    <Button variant="ghost" onClick={onExportClick} className="p-1.5 min-w-0" title="Exportar Dados">
                        <Download size={18} />
                    </Button>
                    <Button variant="secondary" onClick={onCameraClick} className="p-1.5 min-w-0 text-emerald-600 border-emerald-200" title="Importar de Foto">
                        <Camera size={18} />
                    </Button>
                    <Button variant="primary" onClick={onAddNewRow} className="p-1.5 min-w-0" title="Novo Item">
                        <Plus size={18} />
                    </Button>
                </div>
            </div>

            {/* Bottom Row (Mobile) / Right Side (Desktop) */}
            <div className="flex items-center gap-2 px-4 pb-3 sm:px-6 sm:pb-0 w-full sm:w-auto">
                <div className="hidden sm:flex items-center gap-2">
                    <Button variant="ghost" onClick={onExportClick} title="Exportar Dados">
                        <Download size={18} />
                    </Button>
                    <Button variant="primary" onClick={onAddNewRow}>
                        <Plus size={16} />
                        <span className="ml-2">Novo Item</span>
                    </Button>
                    <div className="h-6 w-px bg-slate-200 mx-1"></div>
                    <Button variant="secondary" onClick={onCameraClick} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" title="Importar de Foto">
                        <Camera size={18} />
                        <span className="ml-2">Foto</span>
                    </Button>
                    <div className="h-6 w-px bg-slate-200 mx-2"></div>
                </div>

                {/* Search Input - Always visible */}
                <div className="relative w-full sm:w-48 md:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={searchTerm || ''}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar..."
                        className="pl-9 pr-4 py-2 w-full"
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
