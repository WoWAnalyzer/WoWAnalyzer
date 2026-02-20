import * as design from 'interface/design-system';
import styled from '@emotion/styled';
import { JSX } from 'react';
import Select from 'interface/controls/Select';

const TableContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  container-type: inline-size;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
`;

export const HeaderSelect = styled(Select)`
  width: 100%;
  border: unset;
  box-shadow: unset;
  text-align: center;
  padding: 0.2rem ${design.gaps.medium};
  border-radius: 0;

  &:hover {
    background-color: ${design.level2.background_active};
  }
`;

interface TableCellProps {
  align: React.CSSProperties['justifyContent'];
  optional?: boolean;
}

const TableCell = styled.div<TableCellProps>`
  display: flex;
  flex-direction: row;
  justify-content: ${(props) => props.align};
  padding: 0.2rem ${design.gaps.medium};
  border-right: 1px solid ${design.level1.border};
  width: 100%;

  white-space: nowrap;

  &:has(${HeaderSelect}) {
    padding: 0;
  }

  @container (width < 500px) {
    ${(props) => (props.optional ? 'display: none;' : '')}
  }
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;

  background: ${design.level2.background};
  border: 1px solid ${design.level2.border};
  box-shadow: ${design.level2.shadow};

  & ${TableCell} {
    border-color: ${design.level2.border};

    &:last-of-type {
      border-right: unset;
    }
  }

  & + ${TableRow} {
    padding-top: 0.3rem;
  }
`;

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
          <TableCell key={colIx} align={'center'} optional={col.optional}>
            {col.label}
          </TableCell>
        ))}
      </TableHeader>
      {data.map((row, ix) => (
        <TableRow key={ix}>
          {Object.values(columns).map((col, colIx) => (
            <TableCell align={cellAlignment(col.align)} key={colIx} optional={col.optional}>
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
