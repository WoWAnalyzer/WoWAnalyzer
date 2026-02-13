import styled from '@emotion/styled';
import { formatNumber, formatPercentage } from 'common/format';
import SpellLink from 'interface/SpellLink';
import { JSX, useMemo, useState } from 'react';
import * as design from 'interface/design-system';
import type Spell from 'common/SPELLS/Spell';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { useEvents, useInfo } from 'interface/guide';
import {
  AnyEvent,
  DamageEvent,
  EventType,
  HasAbility,
  HasSource,
  HasTarget,
  HealEvent,
} from 'parser/core/Events';
import { effectiveDamage } from 'parser/shared/modules/DamageValue';
import ActorLink from 'interface/ActorLink';
import { useReport } from 'interface/report/context/ReportContext';
import { Info } from 'parser/core/metric';
import { effectiveHealing } from 'parser/shared/modules/HealingValue';
import { WCLReport } from 'parser/core/Report';
import Unit from 'parser/core/Unit';
import Select from 'interface/controls/Select';

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
  align: React.CSSProperties['justifyContent'];
}

const HeaderSelect = styled(Select)`
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

const TableCell = styled.div<TableCellProps>`
  display: flex;
  flex-direction: row;
  justify-content: ${(props) => props.align};
  padding: 0.2rem ${design.gaps.medium};
  border-right: 1px solid ${design.level1.border};
  width: 100%;

  &:has(${HeaderSelect}) {
    padding: 0;
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

const OTHER_SPECIAL_BY = -9999;

interface Column<T, Context = {}> {
  label: React.ReactNode;
  render(row: T, ctx: Context): React.ReactNode;
  align?: 'left' | 'right';
  expand?: boolean;
}

const actorName: Column<{ actorId: number }> = {
  label: 'Actor', // this is getting overridden by the table
  render(row) {
    if (row.actorId === OTHER_SPECIAL_BY) {
      return <em>Other</em>;
    }

    return <ActorLink id={row.actorId} />;
  },
};

const spellName: Column<{ spell: number | Spell; school?: number }> = {
  label: 'Ability',
  render({ spell, school }) {
    if (spell === OTHER_SPECIAL_BY) {
      return <em>Other</em>;
    }
    return <SpellLink className={school ? `spell-school-${school}` : ''} spell={spell} />;
  },
};

const amountBar: Column<
  { amount: number; school?: number; type?: string },
  { max: number; total: number }
> = {
  label: '',
  render({ amount, school, type }, { max, total }) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '5rem 1fr',
          gap: design.gaps.medium,
          width: '100%',
        }}
      >
        <div style={{ textAlign: 'right' }}>{formatPercentage(amount / total, 1)}%</div>
        <div
          className={
            school ? `spell-school-${school}-bg` : type ? `${type}-bg` : 'spell-school-1-bg'
          }
          style={{ height: '75%', alignSelf: 'center', width: `${(amount / max) * 100}%` }}
        />
      </div>
    );
  },
  expand: true,
};

const amount: Column<{ amount: number }> = {
  label: 'Amount',
  render({ amount }) {
    return formatNumber(amount);
  },
  align: 'right',
};

// we need to use an object for the columns to make TS inferrence play nice
interface TableProps<T, Context, Cols extends Record<string, Column<unknown, unknown>>> {
  data: T[];
  columns: Cols;
  ctx: Context;
}

function cellAlignment(align: Column<any>['align']): React.CSSProperties['justifyContent'] {
  switch (align) {
    case 'right':
      return 'end';
    default:
      return 'start';
  }
}

function Table<T, Context, Cols extends Record<string, Column<unknown, unknown>>>({
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
          <TableCell key={colIx} align={'center'}>
            {col.label}
          </TableCell>
        ))}
      </TableHeader>
      {data.map((row, ix) => (
        <TableRow key={ix}>
          {Object.values(columns).map((col, colIx) => (
            <TableCell align={cellAlignment(col.align)} key={colIx}>
              {col.render(row, ctx)}
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
  type: EventType.Damage | EventType.Heal;
}

type AggregateBy = 'ability' | 'source' | 'target';

interface ThroughputSpellRow {
  spell: number | Spell;
  amount: number;
  school: number;
}

interface ThroughputActorRow {
  actorId: number;
  amount: number;
  type: string | undefined;
}

type ThroughputRow = ThroughputSpellRow | ThroughputActorRow;

const isRelevantToInfo = (info: Info) => (id?: number) =>
  id === info?.playerId || info?.pets.some((pet) => pet.id === id);

function eventMatchesType<Ty extends EventType.Damage | EventType.Heal>(
  event: AnyEvent,
  type: Ty,
): event is AnyEvent<Ty> {
  if (event.type !== type) {
    return false;
  }

  if (
    (event.targetIsFriendly && event.type === EventType.Damage) ||
    (!event.targetIsFriendly && event.type === EventType.Heal)
  ) {
    return false;
  }

  // TODO exclude healing done to pets

  return true;
}

function throughputByAbility(
  events: AnyEvent[],
  info: Info,
  type: EventType.Damage | EventType.Heal,
): ThroughputSpellRow[] {
  const map = new Map<number, ThroughputSpellRow>();
  const isRelevant = isRelevantToInfo(info);

  for (const event of events) {
    if (!eventMatchesType(event, type)) {
      continue;
    }

    if (!isRelevant(event.sourceID)) {
      continue;
    }

    const id = event.ability.guid;
    const school = event.ability.type;
    const amount =
      type === EventType.Damage
        ? effectiveDamage(event as DamageEvent)
        : effectiveHealing(event as HealEvent);

    if (!map.has(id)) {
      map.set(id, {
        spell: id,
        school,
        amount: 0,
      });
    }

    const row = map.get(id)!;
    row.amount += amount;
  }

  return Array.from(map.values());
}

function throughputByActor(
  events: AnyEvent[],
  info: Info,
  actors: Map<number, Unit>,
  type: EventType.Damage | EventType.Heal,
  by: 'sourceID' | 'targetID',
): ThroughputActorRow[] {
  const map = new Map<number, ThroughputActorRow>();
  const isRelevant = isRelevantToInfo(info);

  for (const event of events) {
    if (!eventMatchesType(event, type)) {
      continue;
    }

    if (!isRelevant(event.sourceID)) {
      continue;
    }

    const id = event[by];
    if (!id) {
      continue;
    }

    const actor = actors.get(id);
    const actorType = actor && actor.subType !== '' ? actor.subType : actor?.type;
    const amount =
      type === EventType.Damage
        ? effectiveDamage(event as DamageEvent)
        : effectiveHealing(event as HealEvent);

    if (!map.has(id)) {
      map.set(id, {
        actorId: id,
        type: actorType,
        amount: 0,
      });
    }

    const row = map.get(id)!;
    row.amount += amount;
  }

  return Array.from(map.values());
}

export function ThroughputTable({
  range,
  maxRows = 11,
  type,
}: ThroughputTableProps): JSX.Element | null {
  const { report } = useReport();
  const info = useInfo();
  const events = useEvents(range);
  const [aggregateBy, setAggregateBy] = useState<AggregateBy>('ability');

  const actors = useMemo(() => {
    const map = new Map<number, Unit>();

    report.friendlies
      .concat(report.friendlyPets)
      .concat(report.enemies)
      .concat(report.enemyPets)
      .map((unit) => map.set(unit.id, unit));

    return map;
  }, [report]);

  const data = useMemo(() => {
    if (!info) {
      return [];
    }

    const rows =
      aggregateBy === 'ability'
        ? throughputByAbility(events, info, type)
        : throughputByActor(
            events,
            info,
            actors,
            type,
            (aggregateBy + 'ID') as 'sourceID' | 'targetID',
          );

    const result = Array.from(rows.filter((row) => row.amount > 0));
    result.sort((a, b) => b.amount - a.amount);

    if (result.length > maxRows) {
      const otherTotal = result.slice(maxRows - 1).reduce((total, row) => total + row.amount, 0);
      return [
        ...result.slice(0, maxRows - 1),
        {
          actorId: OTHER_SPECIAL_BY,
          spell: OTHER_SPECIAL_BY,
          type: 'Other',
          amount: otherTotal,
        },
      ];
    }

    return result as ThroughputSpellRow[] | ThroughputActorRow[];
  }, [events, aggregateBy, info]);

  const ctx = useMemo(() => {
    const max = data.reduce((max, row) => Math.max(max, row.amount), 0);
    const total = data.reduce((total, row) => total + row.amount, 0);

    return { max, total };
  }, [data]);

  const nameColumn = useMemo(() => {
    const col = aggregateBy === 'ability' ? spellName : actorName;

    return {
      ...col,
      label: (
        <HeaderSelect
          onChange={(event) => {
            setAggregateBy(event.target.value as AggregateBy);
          }}
          value={aggregateBy}
        >
          <option value={'ability'}>Ability</option>
          <option value={'source'}>Source</option>
          <option value={'target'}>Target</option>
        </HeaderSelect>
      ),
    };
  }, [aggregateBy]);

  const amountColumn = useMemo(
    () => ({
      ...amount,
      label: type === EventType.Damage ? 'Damage' : 'Healing',
    }),
    [type],
  );

  return <Table columns={{ nameColumn, amountBar, amountColumn }} data={data} ctx={ctx} />;
}
