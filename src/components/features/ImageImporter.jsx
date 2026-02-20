import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Check, X, Loader2, Edit2, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { processImageWithGemini } from '../../services/gemini';

export const ImageImporter = ({ onComplete, onCancel }) => {
    const [image, setImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [items, setItems] = useState([]); // Array of objects {name, value, category}
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
        setItems([]);
        try {
            const data = await processImageWithGemini(file);
            if (Array.isArray(data)) {
                setItems(data);
            } else {
                throw new Error("Formato inválido recebido da IA.");
            }
        } catch (error) {
            console.error("Erro no processamento:", error);
            alert("Erro ao processar imagem. Tente novamente.");
            setImage(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleDeleteItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleConfirm = () => {
        // Convert structured items back to simple lines or pass objects?
        // Let's pass objects, App.jsx will need to handle it.
        // For compatibility with previous simple string array flow, we might need to adjust App.jsx
        // But for this improved feature, let's pass the rich data.
        onComplete(items);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                        <Sparkles size={20} className="text-purple-600" />
                        Leitura Inteligente (IA)
                    </h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Default State: Choose Source */}
                    {!image && (
                        <div className="grid grid-cols-2 gap-4 h-48">
                            <button
                                onClick={() => cameraInputRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-slate-500 hover:text-purple-600"
                            >
                                <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                                    <Camera size={24} />
                                </div>
                                <span className="font-medium">Tirar Foto</span>
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-slate-500 hover:text-blue-600"
                            >
                                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                    <ImageIcon size={24} />
                                </div>
                                <span className="font-medium">Galeria</span>
                            </button>

                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                ref={cameraInputRef}
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>
                    )}

                    {/* Processing State */}
                    {image && isProcessing && (
                        <div className="text-center py-12 space-y-6">
                            <div className="relative mx-auto w-24 h-24">
                                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                                <Sparkles className="absolute inset-0 m-auto text-purple-500 animate-pulse" size={32} />
                            </div>
                            <div>
                                <h4 className="text-lg font-medium text-slate-800">Analisando imagem...</h4>
                                <p className="text-slate-500 text-sm mt-1">A IA está identificando os itens e preços para você.</p>
                            </div>
                        </div>
                    )}

                    {/* Results Table */}
                    {image && !isProcessing && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium text-slate-700">Itens Identificados ({items.length})</h4>
                                <button onClick={() => setImage(null)} className="text-xs text-blue-600 hover:underline">
                                    Nova Foto
                                </button>
                            </div>

                            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 border-b">
                                        <tr>
                                            <th className="px-4 py-2 font-medium">Nome do Item</th>
                                            <th className="px-4 py-2 font-medium w-32">Valor</th>
                                            <th className="px-4 py-2 font-medium w-32">Categoria</th>
                                            <th className="px-2 py-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((item, index) => (
                                            <tr key={index} className="group hover:bg-slate-50">
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={item.name}
                                                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                        className="w-full bg-transparent border-none focus:ring-0 p-1 font-medium text-slate-700"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={item.value}
                                                        onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                                                        className="w-full bg-transparent border-none focus:ring-0 p-1 text-slate-600"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={item.category}
                                                        onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                                                        className="w-full bg-transparent border-none focus:ring-0 p-1 text-slate-500 text-xs bg-slate-100 rounded px-2"
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    <button
                                                        onClick={() => handleDeleteItem(index)}
                                                        className="text-slate-300 hover:text-rose-500 transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {items.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="p-8 text-center text-slate-400 italic">
                                                    Nenhum item identificado. Tente outra foto.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {image && !isProcessing && (
                    <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
                        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
                        <Button onClick={handleConfirm} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                            <Check size={18} />
                            Criar Lista
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
