/**
 * Converts an array of objects to a CSV string and triggers a download.
 * @param rows   Array of plain objects (all values will be stringified)
 * @param headers Ordered column definitions: { key, label }
 * @param filename Suggested download filename (should end in .csv)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportToCsv<T extends Record<string, any>>(
  rows: T[],
  headers: { key: keyof T; label: string }[],
  filename: string,
): void {
  const escape = (value: unknown): string => {
    const str = value == null ? '' : String(value);
    // Wrap in quotes if the value contains commas, quotes, or newlines
    if (str.includes('"') || str.includes(',') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerRow = headers.map(h => escape(h.label)).join(',');
  const dataRows = rows.map(row =>
    headers.map(h => escape(row[h.key])).join(','),
  );

  const csv = [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
