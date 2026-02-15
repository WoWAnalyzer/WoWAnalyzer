import { formatNumber, formatPercentage } from 'common/format';
import SpellLink from 'interface/SpellLink';
import { JSX, useMemo, useState } from 'react';
import * as design from 'interface/design-system';
import type Spell from 'common/SPELLS/Spell';
import { useEvents, useInfo } from 'interface/guide';
import { AnyEvent, DamageEvent, EventType, HealEvent } from 'parser/core/Events';
import { effectiveDamage } from 'parser/shared/modules/DamageValue';
import ActorLink from 'interface/ActorLink';
import { useReport } from 'interface/report/context/ReportContext';
import { Info } from 'parser/core/metric';
import { effectiveHealing } from 'parser/shared/modules/HealingValue';
import Unit from 'parser/core/Unit';
import HIT_TYPES from 'game/HIT_TYPES';
import Table, { Column, HeaderSelect } from './Table';

const OTHER_SPECIAL_BY = -9999;

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

const amountBar = (
  type: EventType.Damage | EventType.Heal,
): Column<{ amount: number; school?: number; type?: string }, { max: number; total: number }> => ({
  label: type === EventType.Damage ? 'Damage' : 'Healing',
  render({ amount, school, type }, { max, total }) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '5rem 1fr 4rem',
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
        <div style={{ textAlign: 'right' }}>{formatNumber(amount)}</div>
      </div>
    );
  },
  expand: true,
});

const literalNumberColumn = <K extends string>(
  label: React.ReactNode,
  key: K,
): Column<Record<K, number>> => ({
  label,
  render(row) {
    return row[key];
  },
  align: 'right',
  optional: true,
});

const critPct: Column<{ hits: number; crits: number }> = {
  label: 'Crit %',
  render(row) {
    if (row.crits === 0) {
      return null;
    }

    return `${formatPercentage(row.crits / row.hits, 1)}%`;
  },
  align: 'right',
  optional: true,
};

const avgHit: Column<{ hits: number; amount: number }> = {
  label: 'Avg Hit',
  render(row) {
    return formatNumber(row.amount / row.hits);
  },
  align: 'right',
  optional: true,
};

export interface ThroughputTableProps {
  range?: { start: number; end: number };
  maxRows?: number;
  type: EventType.Damage | EventType.Heal;
}

type AggregateBy = 'ability' | 'source' | 'target';

interface ThroughputRowCommon {
  amount: number;
  hits: number;
  crits: number;
}

interface ThroughputSpellRow extends ThroughputRowCommon {
  spell: number | Spell;
  school: number;
}

interface ThroughputActorRow extends ThroughputRowCommon {
  actorId: number;
  type: string | undefined;
}

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
        hits: 0,
        crits: 0,
      });
    }

    const row = map.get(id)!;
    row.amount += amount;
    row.hits += 1;
    row.crits += Number(event.hitType === HIT_TYPES.CRIT);
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
        hits: 0,
        crits: 0,
      });
    }

    const row = map.get(id)!;
    row.amount += amount;
    row.hits += 1;
    row.crits += Number(event.hitType === HIT_TYPES.CRIT);
  }

  return Array.from(map.values());
}

export default function ThroughputTable({
  range,
  maxRows = 6,
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
      const otherRows = result.slice(maxRows - 1);
      const otherTotal = otherRows.reduce((total, row) => total + row.amount, 0);
      const otherHits = otherRows.reduce((total, row) => total + row.hits, 0);
      const otherCrits = otherRows.reduce((total, row) => total + row.crits, 0);
      return [
        ...result.slice(0, maxRows - 1),
        {
          actorId: OTHER_SPECIAL_BY,
          spell: OTHER_SPECIAL_BY,
          type: 'Other',
          amount: otherTotal,
          hits: otherHits,
          crits: otherCrits,
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

  return (
    <Table
      columns={{
        nameColumn,
        amountBar: amountBar(type),
        hits: literalNumberColumn('Hits', 'hits'),
        avgHit,
        critPct,
      }}
      data={data}
      ctx={ctx}
    />
  );
}

export const DamageTable = (props: Omit<ThroughputTableProps, 'type'>) => (
  <ThroughputTable {...props} type={EventType.Damage} />
);
export const HealingTable = (props: Omit<ThroughputTableProps, 'type'>) => (
  <ThroughputTable {...props} type={EventType.Heal} />
);
