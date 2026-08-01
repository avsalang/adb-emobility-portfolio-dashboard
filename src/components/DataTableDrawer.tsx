import { Download, Table2, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export type DataCell = string | number | null | undefined;
export type DataRow = Record<string, DataCell>;

export interface DataColumn {
  key: string;
  label: string;
  align?: 'left' | 'right';
}

export interface DataView {
  title: string;
  columns: DataColumn[];
  rows: DataRow[];
  filename: string;
}

function downloadRows(view: DataView) {
  const escape = (value: DataCell) =>
    `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [
    view.columns.map((column) => escape(column.label)).join(','),
    ...view.rows.map((row) =>
      view.columns.map((column) => escape(row[column.key])).join(','),
    ),
  ].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = view.filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function DataViewButton({
  onClick,
  label = 'View data',
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button type="button" className="data-view-button" onClick={onClick}>
      <Table2 size={15} />
      {label}
    </button>
  );
}

export function DataTableDrawer({
  view,
  onClose,
}: {
  view: DataView;
  onClose: () => void;
}) {
  const drawerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  return (
    <div className="drawer-backdrop data-drawer-backdrop" onMouseDown={onClose}>
      <aside
        ref={drawerRef}
        className="data-table-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-drawer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="data-drawer-head">
          <div>
            <h2 id="data-drawer-title">{view.title}</h2>
            <span>{view.rows.length.toLocaleString()} records</span>
          </div>
          <div>
            <button
              type="button"
              className="data-drawer-download"
              onClick={() => downloadRows(view)}
            >
              <Download size={15} />
              Download CSV
            </button>
            <button
              ref={closeRef}
              type="button"
              className="data-drawer-close"
              onClick={onClose}
              title="Close data table"
              aria-label="Close data table"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {view.columns.map((column) => (
                  <th key={column.key} className={column.align === 'right' ? 'numeric' : ''}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.rows.map((row, index) => (
                <tr key={`${index}-${String(row[view.columns[0]?.key] ?? '')}`}>
                  {view.columns.map((column) => (
                    <td key={column.key} className={column.align === 'right' ? 'numeric' : ''}>
                      {row[column.key] ?? ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </aside>
    </div>
  );
}
