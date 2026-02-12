import styled from '@emotion/styled';
import { formatNumber, formatPercentage } from 'common/format';
import SpellLink from 'interface/SpellLink';
import { JSX, useMemo, useState } from 'react';
import * as design from 'interface/design-system';
import type Spell from 'common/SPELLS/Spell';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { useEvents, useInfo } from 'interface/guide';
import { AnyEvent, HasAbility, HasSource, HasTarget } from 'parser/core/Events';
import { effectiveDamage } from 'parser/shared/modules/DamageValue';
import ActorLink from 'interface/ActorLink';
import { useReport } from 'interface/report/context/ReportContext';

export default function DamageTable(): JSX.Element | null {
  return null;
}

const TableContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
`;

interface TableCellProps {
  align: Required<React.CSSProperties>['justifyContent'];
}

const TableCell = styled.div<TableCellProps>`
  display: flex;
  flex-direction: row;
  justify-content: ${(props) => props.align};
  padding: 0.2rem ${design.gaps.medium};
  border-right: 1px solid ${design.level1.border};
  width: 100%;
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

interface ColumnProps<T> {
  label: React.ReactNode;
  render: (row: T) => React.ReactNode;
  align: TableCellProps['align'];
  expand?: boolean;
}

type Accessor<Object, Type> =
  | ((obj: Object) => Type)
  | keyof {
      [Key in keyof Object as Object[Key] extends Type ? Key : never]: never;
    };

const OTHER_SPECIAL_BY = -9999;

function actorName<T>(accessor: Accessor<T, number>, label: React.ReactNode): ColumnProps<T> {
  return {
    label,
    align: 'start',
    render: (row: T) => (
      <ActorLink id={typeof accessor === 'function' ? accessor(row) : (row[accessor] as number)} />
    ),
  };
}

function spellName<T>(
  accessor: Accessor<T, Spell | number>,
  school?: Accessor<T, number>,
): ColumnProps<T> {
  return {
    label: <>Ability</>,
    render: (row: T) => {
      const id = typeof accessor === 'function' ? accessor(row) : (row[accessor] as Spell | number);
      if (id === OTHER_SPECIAL_BY) {
        return 'Other';
      }

      return (
        <SpellLink
          className={
            school
              ? `spell-school-${typeof school === 'function' ? school(row) : (row[school] as number)}`
              : ''
          }
          spell={id}
        />
      );
    },
    align: 'left',
  };
}

function amountBar<T>(
  accessor: Accessor<T, number>,
  backgroundClass: Accessor<T, string>,
  max: number,
): ColumnProps<T> {
  return {
    label: <></>,
    align: 'stretch',
    expand: true,
    render: (row: T) => {
      return (
        <div
          className={
            typeof backgroundClass === 'function'
              ? backgroundClass(row)
              : (row[backgroundClass] as string)
          }
          style={{
            height: '75%',
            alignSelf: 'center',
            width: `${(((typeof accessor === 'function' ? accessor(row) : row[accessor]) as number) / max) * 100}%`,
          }}
        />
      );
    },
  };
}

function amount<T>(accessor: Accessor<T, number>, label: React.ReactNode): ColumnProps<T> {
  return {
    label,
    align: 'right',
    render: (row: T) =>
      formatNumber(typeof accessor === 'function' ? accessor(row) : (row[accessor] as number)),
  };
}

function percentage<T>(accessor: Accessor<T, number>, total: number): ColumnProps<T> {
  return {
    label: <></>,
    align: 'right',
    render: (row: T) =>
      `${formatPercentage((typeof accessor === 'function' ? accessor(row) : (row[accessor] as number)) / total)}%`,
  };
}

interface TableProps<T> {
  data: T[];
  columns: ColumnProps<T>[];
}

function Table<T>({ data, columns }: TableProps<T>): JSX.Element | null {
  const gridColumns = columns.map((col) => (col.expand ? '1fr' : 'auto')).join(' ');

  return (
    <TableContainer style={{ gridTemplateColumns: gridColumns }}>
      <TableHeader>
        {columns.map((col, colIx) => (
          <TableCell key={colIx} align={'center'}>
            {col.label}
          </TableCell>
        ))}
      </TableHeader>
      {data.map((row, ix) => (
        <TableRow key={ix}>
          {columns.map((col, colIx) => (
            <TableCell align={col.align} key={colIx}>
              {col.render(row)}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableContainer>
  );
}

interface ThroughputTableProps {
  range?: { start: number; end: number };
  maxRows?: number;
}

type AggregateBy = 'ability' | 'source' | 'target';

interface ThroughputRow {
  by: number;
  amount: number;
  school: number;
}

function aggregateByKey(event: AnyEvent, by: AggregateBy): number | null {
  switch (by) {
    case 'ability':
      return HasAbility(event) ? event.ability.guid : null;
    case 'source':
      return HasSource(event) ? event.sourceID : null;
    case 'target':
      return HasTarget(event) ? event.targetID : null;
  }
}

export function ThroughputTable({
  range,
  maxRows = Infinity,
}: ThroughputTableProps): JSX.Element | null {
  const { report } = useReport();
  const info = useInfo();
  const events = useEvents(range);
  const [aggregateBy, setAggregateBy] = useState<AggregateBy>('ability');

  const data = useMemo(() => {
    const map = new Map<number, ThroughputRow>();

    const isPlayerRelevant = (id?: number) =>
      id === info?.playerId || info?.pets.some((pet) => pet.id === id);

    for (const event of events) {
      if (event.type !== 'damage') {
        continue;
      }

      if (!isPlayerRelevant(event.sourceID)) {
        continue;
      }

      if (event.targetIsFriendly) {
        continue;
      }

      const key = aggregateByKey(event, aggregateBy);
      if (key === null) {
        continue; // explicitly discard events with no aggregation key
      }

      if (!map.has(key)) {
        map.set(key, {
          by: key,
          amount: 0,
          school: MAGIC_SCHOOLS.ids.PHYSICAL,
        });
      }

      const row = map.get(key)!;
      row.amount += effectiveDamage(event);
      row.school = event.ability.type;
    }

    const result = Array.from(map.values().filter((row) => row.amount > 0));
    result.sort((a, b) => b.amount - a.amount);

    if (result.length > maxRows) {
      const otherTotal = result.slice(maxRows - 1).reduce((total, row) => total + row.amount, 0);
      return [
        ...result.slice(0, maxRows - 1),
        {
          by: OTHER_SPECIAL_BY,
          amount: otherTotal,
          school: MAGIC_SCHOOLS.ids.PHYSICAL,
        },
      ];
    }

    return result;
  }, [events, aggregateBy, info]);

  const max = data.reduce((a, b) => Math.max(a, b.amount), 0);

  const nameColumn = useMemo(
    () =>
      aggregateBy === 'ability'
        ? spellName<ThroughputRow>('by', 'school')
        : actorName<ThroughputRow>('by', aggregateBy === 'source' ? 'Source' : 'Target'),
    [aggregateBy],
  );

  const barColumn = useMemo(
    () =>
      aggregateBy === 'ability'
        ? amountBar<ThroughputRow>('amount', (row) => `spell-school-${row.school}-bg`, max)
        : amountBar<ThroughputRow>(
            'amount',
            (row) =>
              (report.friendlies
                .concat(report.enemies)
                .concat(report.friendlyPets)
                .concat(report.enemyPets)
                .find((actor) => row.by === actor.id)?.type ?? 'NPC') + '-bg',
            max,
          ),
    [report, aggregateBy],
  );

  return (
    <Table
      data={data}
      columns={[
        // ok, maybe this type shenanigan isn't worthwhile...
        nameColumn,
        barColumn,
        amount<(typeof data)[number]>('amount', 'Damage'),
      ]}
    />
  );
}
