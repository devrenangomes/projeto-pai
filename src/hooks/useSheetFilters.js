import { useState, useMemo } from 'react';

export const useSheetFilters = (activeSheet) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const filteredData = useMemo(() => {
        if (!activeSheet) return [];

        let result = activeSheet.data.filter((row) => {
            const searchString = searchTerm.toLowerCase();
            return activeSheet.columns.some(col =>
                String(row[col] || '').toLowerCase().includes(searchString)
            );
        });

        if (sortConfig.key) {
            result.sort((a, b) => {
                const valA = a[sortConfig.key] || '';
                const valB = b[sortConfig.key] || '';

                const numA = parseFloat(valA.replace ? valA.replace(/[^0-9.-]+/g, "") : valA);
                const numB = parseFloat(valB.replace ? valB.replace(/[^0-9.-]+/g, "") : valB);

                if (!isNaN(numA) && !isNaN(numB)) {
                    return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [activeSheet, searchTerm, sortConfig]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return {
        searchTerm,
        setSearchTerm,
        sortConfig,
        handleSort,
        filteredData
    };
};
