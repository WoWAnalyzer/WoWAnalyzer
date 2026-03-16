import * as design from 'interface/design-system';
import { type ComponentPropsWithoutRef, type CSSProperties, forwardRef, JSX } from 'react';
import Select from 'interface/controls/Select';
import styles from './Table.module.scss';

type HeaderSelectProps = ComponentPropsWithoutRef<typeof Select>;

export const HeaderSelect = forwardRef<HTMLSelectElement, HeaderSelectProps>(
  ({ className, style, ...props }, ref) => {
    const headerSelectStyle = {
      ...style,
      border: 'unset',
      boxShadow: 'unset',
      padding: `0.2rem ${design.gaps.medium}`,
      '--table-header-select-hover-bg': design.level2.background_active,
    } as CSSProperties;

    return (
      <Select
        ref={ref}
        className={[styles.headerSelect, className].filter(Boolean).join(' ')}
        style={headerSelectStyle}
        {...props}
      />
    );
  },
);

// we need to use an object for the columns to make TS inferrence play nice
interface TableProps<T, Context, Cols extends Record<string, Column<unknown, unknown>>> {
  data: T[];
  columns: Cols;
  ctx: Context;
}

function cellAlignment(align: Column<unknown>['align']): CSSProperties['justifyContent'] {
  switch (align) {
    case 'right':
      return 'end';
    default:
      return 'start';
  }
}

export default function Table<T, Context, Cols extends Record<string, Column<unknown, unknown>>>({
  data,
  columns,
  ctx,
}: TableProps<T, Context, Cols>): JSX.Element | null {
  const gridColumns = Object.values(columns)
    .map((col) => (col.expand ? '1fr' : 'auto'))
    .join(' ');
  const tableContainerStyle = {
    gridTemplateColumns: gridColumns,
    '--table-cell-border-color': design.level1.border,
  } as CSSProperties;
  const tableHeaderStyle = {
    background: design.level2.background,
    border: `1px solid ${design.level2.border}`,
    boxShadow: design.level2.shadow,
    '--table-cell-border-color': design.level2.border,
  } as CSSProperties;

  return (
    <div className={styles.tableContainer} style={tableContainerStyle}>
      <div className={styles.tableHeader} style={tableHeaderStyle}>
        {Object.values(columns).map((col, colIx) => (
          <div
            key={colIx}
            className={[styles.tableCell, col.optional ? styles.optionalCell : undefined]
              .filter(Boolean)
              .join(' ')}
            style={{ '--table-cell-align': 'center' } as CSSProperties}
          >
            {col.label}
          </div>
        ))}
      </div>
      {data.map((row, ix) => (
        <div key={ix} className={styles.tableRow}>
          {Object.values(columns).map((col, colIx) => (
            <div
              key={colIx}
              className={[styles.tableCell, col.optional ? styles.optionalCell : undefined]
                .filter(Boolean)
                .join(' ')}
              style={{ '--table-cell-align': cellAlignment(col.align) } as CSSProperties}
            >
              {col.render(row, ctx)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export interface Column<T, Context = object> {
  label: React.ReactNode;
  render(row: T, ctx: Context): React.ReactNode;
  align?: 'left' | 'right';
  expand?: boolean;
  optional?: boolean;
}
