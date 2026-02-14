import React from 'react';
import { ArrowUpDown, Check, X, Edit2, Trash2, FileSpreadsheet } from 'lucide-react';

// We could extract Row and Cell further, but keeping them here for now as requested structure
const EmployeeTable = ({
    activeSheet,
    filteredData,
    sortConfig,
    onSort,
    editingId,
    onEditClick,
    onSaveEdit,
    onDeleteRow,
    editFormData,
    setEditFormData
}) => {

    const renderCellContent = (colName, value) => {
        const lowerCol = colName.toLowerCase();

        if (lowerCol.includes('salário') || lowerCol.includes('salary') || lowerCol.includes('preço')) {
            const num = parseFloat(String(value).replace(/[^0-9.-]+/g, ""));
            if (!isNaN(num)) return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
        }

        if (lowerCol.includes('status')) {
            let colorClass = 'bg-slate-100 text-slate-700';
            const lowerVal = String(value).toLowerCase();
            if (lowerVal.includes('ativo') || lowerVal.includes('ok') || lowerVal.includes('pago')) colorClass = 'bg-emerald-100 text-emerald-700';
            if (lowerVal.includes('ferias') || lowerVal.includes('férias') || lowerVal.includes('pendente')) colorClass = 'bg-amber-100 text-amber-700';
            if (lowerVal.includes('erro') || lowerVal.includes('cancelado') || lowerVal.includes('inativo')) colorClass = 'bg-rose-100 text-rose-700';

            return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                    {value}
                </span>
            );
        }

        return value;
    };

    return (
        <div className="flex-1 overflow-auto bg-slate-50 p-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-w-full inline-block">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                {activeSheet.columns.map((col, idx) => (
                                    <th
                                        key={idx}
                                        onClick={() => onSort(col)}
                                        className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group select-none whitespace-nowrap"
                                    >
                                        <div className="flex items-center gap-1">
                                            {col}
                                            {sortConfig.key === col && (
                                                <ArrowUpDown size={12} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                                            )}
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-3 w-20 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.length > 0 ? filteredData.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/80 group">
                                    {editingId === row.id ? (
                                        <>
                                            {activeSheet.columns.map(col => (
                                                <td key={col} className="px-6 py-3">
                                                    <input
                                                        className="w-full bg-white border border-emerald-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-100 outline-none"
                                                        value={editFormData[col] || ''}
                                                        onChange={(e) => setEditFormData({ ...editFormData, [col]: e.target.value })}
                                                    />
                                                </td>
                                            ))}
                                            <td className="px-6 py-3 text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={onSaveEdit} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded bg-white border border-emerald-200 shadow-sm">
                                                        <Check size={14} />
                                                    </button>
                                                    <button onClick={() => onDeleteRow(row.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded bg-white border border-rose-200 shadow-sm">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            {activeSheet.columns.map(col => (
                                                <td key={col} className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                                    {renderCellContent(col, row[col])}
                                                </td>
                                            ))}
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => onEditClick(row)}
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteRow(row.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={activeSheet.columns.length + 1} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileSpreadsheet size={32} className="text-slate-200" />
                                            <p>Lista vazia ou nenhum resultado encontrado.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmployeeTable;
