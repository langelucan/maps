export const Exporters = {
  toCSV(data) {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const rows = [headers.join(',')];

    for (const item of data) {
      const values = headers.map(header => {
        const value = item[header] !== undefined ? item[header] : '';
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      rows.push(values.join(','));
    }

    return rows.join('\n');
  },

  toJSON(data) {
    return JSON.stringify(data, null, 2);
  },

  async toExcel(data) {
    if (!data || data.length === 0) {
      return null;
    }

    const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Données');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return excelBuffer;
  },

  toXML(data) {
    if (!data || data.length === 0) {
      return '<?xml version="1.0" encoding="UTF-8"?><data></data>';
    }

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';

    data.forEach(item => {
      xml += '  <item>\n';
      Object.keys(item).forEach(key => {
        const value = item[key] !== undefined ? item[key] : '';
        const escaped = String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
        xml += `    <${key}>${escaped}</${key}>\n`;
      });
      xml += '  </item>\n';
    });

    xml += '</data>';
    return xml;
  }
};

export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

export function getExportMimeType(format) {
  const mimeTypes = {
    csv: 'text/csv;charset=utf-8;',
    json: 'application/json;charset=utf-8;',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xml: 'application/xml;charset=utf-8;'
  };

  return mimeTypes[format] || mimeTypes.csv;
}
