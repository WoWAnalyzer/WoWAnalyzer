import cssComponent from 'interface/utils/css-component';
import styles from './Table.module.scss';
import { JSX } from 'react';
import Select from 'interface/controls/Select';
import clsx from 'clsx';

const TableContainer = cssComponent('div', styles.TableContainer, [] as const);

const TableRow = cssComponent('div', styles.TableRow, [] as const);

export const HeaderSelect = cssComponent(Select, styles.HeaderSelect, [] as const);

interface TableCellProps {
  align: React.CSSProperties['justifyContent'];
  children?: React.ReactNode;
  className?: string;
}

const TableCell: React.FC<TableCellProps> = cssComponent('div', styles.TableCell, [
  'align',
] as const);

const TableHeader = cssComponent('div', styles.TableHeader, [] as const);

// we need to use an object for the columns to make TS inferrence play nice
interface TableProps<T, Context, Cols extends Record<string, Column<unknown, unknown>>> {
  data: T[];
  columns: Cols;
  ctx: Context;
}

function cellAlignment(align: Column<unknown>['align']): React.CSSProperties['justifyContent'] {
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

  return (
    <TableContainer style={{ gridTemplateColumns: gridColumns }}>
      <TableHeader>
        {Object.values(columns).map((col, colIx) => (
          <TableCell key={colIx} align={'center'} className={clsx(col.optional && styles.optional)}>
            {col.label}
          </TableCell>
        ))}
      </TableHeader>
      {data.map((row, ix) => (
        <TableRow key={ix}>
          {Object.values(columns).map((col, colIx) => (
            <TableCell
              align={cellAlignment(col.align)}
              key={colIx}
              className={clsx(col.optional && styles.optional)}
            >
              {col.render(row, ctx)}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableContainer>
  );
}

export interface Column<T, Context = object> {
  label: React.ReactNode;
  render(row: T, ctx: Context): React.ReactNode;
  align?: 'left' | 'right';
  expand?: boolean;
  optional?: boolean;
}
