export const processCSV = (str, fileName) => {
    if (!str || !str.trim()) return null;
    const rows = str.split('\n');
    if (rows.length < 1) return null;

    const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    const newData = [];

    for (let i = 1; i < rows.length; i++) {
        const rowStr = rows[i].trim();
        if (!rowStr) continue;

        const values = rowStr.split(',');

        const rowObj = { id: Date.now() + i };
        headers.forEach((header, index) => {
            const val = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
            rowObj[header] = val;
        });

        newData.push(rowObj);
    }

    return {
        id: `sheet-${Date.now()}`,
        name: fileName.replace('.csv', ''),
        columns: headers,
        data: newData
    };
};
