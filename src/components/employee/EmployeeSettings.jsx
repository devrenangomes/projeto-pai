import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, PlusCircle, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

const EmployeeSettings = ({ isOpen, onClose, activeSheet, onSave, onDelete }) => {
    const [tempSheetSettings, setTempSheetSettings] = useState({ name: '', columns: [] });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (isOpen && activeSheet) {
            setTempSheetSettings({
                name: activeSheet.name,
                columns: activeSheet.columns.map(col => ({ id: Math.random(), original: col, current: col }))
            });
        }
    }, [isOpen, activeSheet]);

    const handleSave = () => {
        if (!tempSheetSettings.name.trim()) {
            alert("O nome da lista não pode ser vazio.");
            return;
        }
        if (tempSheetSettings.columns.some(c => !c.current.trim())) {
            alert("Nomes de colunas não podem ser vazios.");
            return;
        }
        onSave(tempSheetSettings);
        onClose();
    };

    const handleColumnChange = (id, newValue) => {
        setTempSheetSettings(prev => ({
            ...prev,
            columns: prev.columns.map(c => c.id === id ? { ...c, current: newValue } : c)
        }));
    };

    const handleAddColumn = () => {
        setTempSheetSettings(prev => ({
            ...prev,
            columns: [...prev.columns, { id: Math.random(), original: null, current: 'Nova Coluna' }]
        }));
    };

    const handleRemoveColumn = (id) => {
        if (tempSheetSettings.columns.length <= 1) {
            alert("A lista deve ter pelo menos uma coluna.");
            return;
        }
        setTempSheetSettings(prev => ({
            ...prev,
            columns: prev.columns.filter(c => c.id !== id)
        }));
    };

    const title = (
        <span className="flex items-center gap-2">
            <Settings size={20} className="text-emerald-600" />
            Editar Estrutura
        </span>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={showDeleteConfirm ? "Confirmação" : title}>
            {showDeleteConfirm ? (
                <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Excluir esta lista?</h3>
                    <p className="text-slate-500 mb-8 max-w-xs">
                        Você tem certeza que deseja excluir <strong>{tempSheetSettings.name}</strong>?
                        <br />Esta ação é irreversível e todos os dados serão perdidos.
                    </p>
                    <div className="flex gap-3 w-full justify-center">
                        <Button
                            variant="secondary"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="w-32 justify-center"
                        >
                            Cancelar
                        </Button>
                        <button
                            onClick={onDelete}
                            className="w-32 bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 rounded-lg transition-colors shadow-sm hover:shadow active:scale-95 transform"
                        >
                            Sim, Excluir
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Nome da Lista</label>
                        <Input
                            value={tempSheetSettings.name}
                            onChange={(e) => setTempSheetSettings({ ...tempSheetSettings, name: e.target.value })}
                            className="w-full px-3 py-2"
                            placeholder="Ex: Departamento Pessoal"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-slate-700">Colunas (Atributos)</label>
                            <button
                                onClick={handleAddColumn}
                                className="text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                                <PlusCircle size={14} />
                                Adicionar Coluna
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                            {tempSheetSettings.columns.map((col, idx) => (
                                <div key={col.id} className="flex items-center gap-2 group">
                                    <div className="w-6 text-xs text-slate-400 text-center font-mono">{idx + 1}</div>
                                    <Input
                                        value={col.current}
                                        onChange={(e) => handleColumnChange(col.id, e.target.value)}
                                        className="flex-1 px-3 py-1.5"
                                        placeholder="Nome da coluna"
                                    />
                                    <button
                                        onClick={() => handleRemoveColumn(col.id)}
                                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                        title="Remover coluna"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-2 text-amber-700 text-xs">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <p>Alterar nomes de colunas atualizará os dados existentes. Excluir uma coluna apagará permanentemente os dados contidos nela.</p>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="text-rose-500 hover:text-rose-700 text-sm font-medium flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-rose-50 transition-colors"
                        >
                            <Trash2 size={16} />
                            Excluir Lista
                        </button>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button variant="primary" onClick={handleSave}>
                                <Save size={16} />
                                Salvar Alterações
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Modal>
    );
};

export default EmployeeSettings;
