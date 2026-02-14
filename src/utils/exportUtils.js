
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Theme Configurations ---
const PDF_THEMES = {
    clean: {
        headStyles: { fillColor: [240, 240, 240], textColor: [40, 40, 40], fontStyle: 'bold' },
        bodyStyles: { textColor: [60, 60, 60] },
        alternateRowStyles: { fillColor: [255, 255, 255] },
        borderColor: [200, 200, 200]
    },
    professional: {
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: 'bold' },
        bodyStyles: { textColor: [50, 50, 50] },
        alternateRowStyles: { fillColor: [240, 248, 255] }, // AliceBlue
        borderColor: [200, 200, 200]
    },
    modern: {
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' }, // Emerald-500
        bodyStyles: { textColor: [50, 50, 50] },
        alternateRowStyles: { fillColor: [236, 253, 245] }, // Emerald-50
        borderColor: [209, 250, 229]
    },
    vibrant: {
        headStyles: { fillColor: [124, 58, 237], textColor: [255, 255, 255], fontStyle: 'bold' }, // Violet-600
        bodyStyles: { textColor: [50, 50, 50] },
        alternateRowStyles: { fillColor: [245, 243, 255] }, // Violet-50
        borderColor: [221, 214, 254]
    }
};

// --- Export Functions ---

// --- Helper for File Download ---
const saveFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportToCSV = (data, columns, filename) => {
    try {
        // Headers
        const separator = ',';
        const keys = columns;
        const csvContent = [
            keys.join(separator),
            ...data.map(row => keys.map(k => {
                let cell = row[k] === null || row[k] === undefined ? '' : String(row[k]);
                cell = cell.replace(/"/g, '""');
                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = `"${cell}"`;
                }
                return cell;
            }).join(separator))
        ].join('\n');

        // Add BOM for Excel UTF-8 compatibility
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        saveFile(blob, `${filename}.csv`);
        return true;
    } catch (e) {
        console.error("CSV Export Error:", e);
        return false;
    }
};

export const exportToExcel = (data, columns, filename) => {
    try {
        // Construct data array ensuring column order
        const formattedData = data.map(row => {
            const newRow = {};
            columns.forEach(col => {
                newRow[col] = row[col];
            });
            return newRow;
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: columns });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");

        // Generate binary string
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        saveFile(blob, `${filename}.xlsx`);
        return true;
    } catch (e) {
        console.error("Excel Export Error:", e);
        return false;
    }
};

export const exportToPDF = (data, columns, filename, theme = 'clean') => {
    try {
        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(18);
        doc.text(filename, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 30);

        // Prep Data for AutoTable
        const tableBody = data.map(row => columns.map(col => row[col]));

        const themeConfig = PDF_THEMES[theme] || PDF_THEMES.clean;

        autoTable(doc, {
            startY: 35,
            head: [columns],
            body: tableBody,
            theme: 'grid', // 'striped', 'grid', 'plain'
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: themeConfig.headStyles,
            bodyStyles: themeConfig.bodyStyles,
            alternateRowStyles: themeConfig.alternateRowStyles,
        });

        doc.save(`${filename}.pdf`);
        return true;
    } catch (e) {
        console.error("PDF Export Error:", e);
        return false;
    }
};
