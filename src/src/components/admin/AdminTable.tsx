import React, { ReactNode } from 'react';

export interface AdminTableColumn<T = unknown> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (value: unknown, row: T) => ReactNode;
}

interface AdminTableProps<T = unknown> {
  columns: AdminTableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  onRowHover?: (e: React.MouseEvent<HTMLTableRowElement>) => void;
  onRowLeave?: (e: React.MouseEvent<HTMLTableRowElement>) => void;
}

export const AdminTable = <T = unknown,>({
  columns,
  data,
  emptyMessage = 'No data found.',
  onRowHover,
  onRowLeave
}: AdminTableProps<T>) => {
  return (
    <div style={{ 
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'separate',
          borderSpacing: 0,
          overflow: 'visible'
        }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index}
                  scope="col" 
                  style={{ 
                    padding: '10px 16px',
                    fontSize: '11px', 
                    fontWeight: 500, 
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: column.align || 'left',
                    borderBottom: '1px solid #d1d5db',
                    ...(column.width && { width: column.width })
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#ffffff', position: 'relative' }}>
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="text-center" 
                  style={{ 
                    padding: '48px 24px',
                    color: '#6b7280', 
                    fontSize: '12px',
                    borderBottom: 'none'
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  onMouseEnter={onRowHover}
                  onMouseLeave={onRowLeave}
                  style={{ 
                    borderBottom: '1px solid #e5e7eb',
                    transition: 'background-color 0.15s'
                  }}
                >
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex}
                      style={{ 
                        padding: '12px 16px',
                        textAlign: column.align || 'left',
                        ...(column.key === 'actions' && { 
                          position: 'relative',
                          whiteSpace: 'nowrap' 
                        })
                      }}
                    >
                      {column.render 
                        ? column.render((row as Record<string, unknown>)[column.key], row)
                        : String((row as Record<string, unknown>)[column.key] ?? '')
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

