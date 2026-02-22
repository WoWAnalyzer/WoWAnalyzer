import { formatNumber, formatPercentage } from 'common/format';
import SpellLink from 'interface/SpellLink';
import { JSX, useMemo, useState } from 'react';
import * as design from 'interface/design-system';
import type Spell from 'common/SPELLS/Spell';
import { useEvents, useInfo } from 'interface/guide';
import { AnyEvent, EventType } from 'parser/core/Events';
import { effectiveDamage } from 'parser/shared/modules/DamageValue';
import ActorLink from 'interface/ActorLink';
import { useReport } from 'interface/report/context/ReportContext';
import { Info } from 'parser/core/metric';
import { effectiveHealing } from 'parser/shared/modules/HealingValue';
import Unit from 'parser/core/Unit';
import HIT_TYPES from 'game/HIT_TYPES';
import Table, { Column, HeaderSelect } from './Table';
import React from 'react';
import { WCLReport } from 'parser/core/Report';

export const OTHER_SPECIAL_ID = -9999;

const actorName: Column<{ actorId: number }> = {
  label: 'Actor', // this is getting overridden by the table
  render(row) {
    if (row.actorId === OTHER_SPECIAL_ID) {
      return <em>Other</em>;
    }

    return <ActorLink id={row.actorId} />;
  },
};

export const spellName: Column<{ spell: number | Spell; school?: number; isPet?: boolean }> = {
  label: 'Ability',
  render({ spell, school, isPet }) {
    if (spell === OTHER_SPECIAL_ID) {
      return <em>Other</em>;
    }
    return (
      <>
        <SpellLink className={school ? `spell-school-${school}` : ''} spell={spell} />
        {isPet ? <>&nbsp;(Pet)</> : null}
      </>
    );
  },
};

export const amountBar = (
  type: EventType.Damage | EventType.Heal,
): Column<
  { amount: number; school?: number; type?: string; isAbsorb?: boolean },
  { max: number; total: number }
> => ({
  label: type === EventType.Damage ? 'Damage' : 'Healing',
  render({ amount, school, type, isAbsorb }, { max, total }) {
    return (
      <div
        style={{
          display: 'grid',
          // would be nice to not need to used a fixed-width column for the right-side number
          // using a variable size causes the bars to no have matching scales.
          gridTemplateColumns: '5rem 1fr 5rem',
          gap: design.gaps.medium,
          width: '100%',
        }}
      >
        <div style={{ textAlign: 'right' }}>{formatPercentage(amount / total, 1)}%</div>
        <div
          className={
            school ? `spell-school-${school}-bg` : type ? `${type}-bg` : 'spell-school-1-bg'
          }
          style={{
            height: '75%',
            alignSelf: 'center',
            width: `${(amount / max) * 100}%`,
            filter: isAbsorb ? 'brightness(60%)' : undefined,
          }}
        />
        <div style={{ textAlign: 'right' }}>{formatNumber(amount, max >= 100_000_000 ? 1 : 2)}</div>
      </div>
    );
  },
  expand: true,
});

export const literalNumberColumn = <K extends string>(
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
  /**
   * The maximum number of rows to show. The final row is the `Other` row and counts against this limit, unless it is disabled by setting `omitOtherRow`.
   */
  maxRows?: number;
  type: EventType.Damage | EventType.Heal;
  /**
   * The list of abilities to include. All other abilities are moved to the `Other` category, unless `omitOtherRow` is set (in which case all other abilities are omitted).
   *
   * By default, all abilities are included. The filter is useful if you're showing a cooldown that affects a specific list of abilities and you want to show only those.
   *
   * Filtered abilities are completely hidden from the source/target views when `omitOtherRow` is true. Otherwise, they are included. This causes the total values to add up to the same value.
   */
  abilityFilter?: (Spell | number)[];
  omitOtherRow?: boolean;
  /**
   * A list of unit/actor ids to include as targets. All other units/actors are omitted from the table. By default, all actors are included for damage and all non-pet actors for healing. When explicitly set to `false`, no default filtering is applied.
   */
  targetExclusions?: Set<number> | false;
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
  isAbsorb?: boolean;
  isPet?: boolean;
}

interface ThroughputActorRow extends ThroughputRowCommon {
  actorId: number;
  type: string | undefined;
}

const isRelevantToInfo = (info: Info) => (id?: number) =>
  id === info?.playerId || info?.pets.some((pet) => pet.id === id);

const includedEventTypes = {
  [EventType.Damage]: new Set([EventType.Damage as const]),
  [EventType.Heal]: new Set([EventType.Heal as const, EventType.Absorbed as const]),
};

type IncludedEvents<T extends keyof typeof includedEventTypes> =
  (typeof includedEventTypes)[T] extends Set<infer E extends EventType> ? AnyEvent<E> : never;

function eventMatchesType<Ty extends EventType.Damage | EventType.Heal>(
  event: AnyEvent,
  type: Ty,
): event is IncludedEvents<Ty> {
  const includedTypes = includedEventTypes[type];
  if (!(includedTypes as Set<EventType>).has(event.type)) {
    return false;
  }

  const expectedTargetIsFriendly = type === EventType.Heal;

  if ('targetIsFriendly' in event && expectedTargetIsFriendly === event.targetIsFriendly) {
    return true;
  }

  return false;
}

function throughputByAbility(
  events: AnyEvent[],
  info: Info,
  type: EventType.Damage | EventType.Heal,
  abilityFilter: Set<number> | undefined,
  targetFilter?: ThroughputTableProps['targetExclusions'],
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

    if (targetFilter && targetFilter.has(event.targetID)) {
      continue; // unlike `abilityFilter`, `targetFilter` does not move to `other`
    }

    const id =
      !abilityFilter || abilityFilter?.has(event.ability.guid)
        ? event.ability.guid
        : OTHER_SPECIAL_ID;
    const school = id === OTHER_SPECIAL_ID ? 0 : event.ability.type;
    const amount =
      type === EventType.Damage
        ? effectiveDamage(event as IncludedEvents<EventType.Damage>)
        : effectiveHealing(event as IncludedEvents<EventType.Heal>);

    if (!map.has(id)) {
      map.set(id, {
        spell: id,
        school,
        amount: 0,
        hits: 0,
        crits: 0,
        isAbsorb: event.type === EventType.Absorbed,
        isPet: info.pets.some((pet) => pet.id === event.sourceID),
      });

      if (id === OTHER_SPECIAL_ID) {
        // hack for 'Other' background
        (map.get(id)! as unknown as ThroughputActorRow).type = 'Other';
      }
    }

    const row = map.get(id)!;

    if (info.pets.every((pet) => pet.id !== event.sourceID)) {
      row.isPet = false; // if an ability can come from both pet and player, mark as non-pet. we don't do hybrid bars
    }
    row.amount += amount;
    row.hits += 1;
    row.crits += 'hitType' in event ? Number(event.hitType === HIT_TYPES.CRIT) : 0;
  }

  return Array.from(map.values());
}

function throughputByActor(
  events: AnyEvent[],
  info: Info,
  actors: Map<number, Unit>,
  type: EventType.Damage | EventType.Heal,
  by: 'sourceID' | 'targetID',
  abilityFilter: Set<number> | undefined,
  targetFilter?: ThroughputTableProps['targetExclusions'],
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

    if (abilityFilter && !abilityFilter.has(event.ability.guid)) {
      continue; // completely hide these abilities for by-actor views
    }

    if (targetFilter && targetFilter.has(event.targetID)) {
      continue; // completely exclude this target
    }

    const actor = actors.get(id);
    const actorType = actor && actor.subType !== '' ? actor.subType : actor?.type;
    const amount =
      type === EventType.Damage
        ? effectiveDamage(event as IncludedEvents<EventType.Damage>)
        : effectiveHealing(event as IncludedEvents<EventType.Heal>);

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
    row.crits += 'hitType' in event ? Number(event.hitType === HIT_TYPES.CRIT) : 0;
  }

  return Array.from(map.values());
}

function isOther(row: ThroughputActorRow | ThroughputSpellRow): boolean {
  if ('spell' in row) {
    return row.spell === OTHER_SPECIAL_ID;
  }
  if ('actorId' in row) {
    return row.actorId === OTHER_SPECIAL_ID;
  }

  return false;
}

function ThroughputTableRaw({
  range,
  maxRows = 6,
  type,
  abilityFilter,
  omitOtherRow,
  targetExclusions: rawUnitFilter,
}: ThroughputTableProps): JSX.Element | null {
  const { report } = useReport();
  const info = useInfo();
  const events = useEvents(range);
  const [aggregateBy, setAggregateBy] = useState<AggregateBy>('ability');

  const unitFilter = useMemo(() => {
    if (rawUnitFilter) {
      return rawUnitFilter;
    }
    if (type === EventType.Heal && rawUnitFilter !== false) {
      return excludeReportPets(report);
    }

    return undefined;
  }, [rawUnitFilter, report, type]);

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

    let filterSet = undefined;
    if (abilityFilter) {
      filterSet = new Set(
        abilityFilter.map((spell) => (typeof spell === 'number' ? spell : spell.id)),
      );
    }

    const rows =
      aggregateBy === 'ability'
        ? throughputByAbility(events, info, type, filterSet, unitFilter)
        : throughputByActor(
            events,
            info,
            actors,
            type,
            (aggregateBy + 'ID') as 'sourceID' | 'targetID',
            omitOtherRow ? filterSet : undefined,
            unitFilter,
          );

    const other = rows.find(isOther);
    const result = Array.from(rows.filter((row) => row.amount > 0 && !isOther(row)));
    result.sort((a, b) => b.amount - a.amount);

    if (omitOtherRow) {
      return result.slice(0, maxRows);
    }

    const otherOffset = other ? 1 : 0;

    if (result.length + otherOffset > maxRows) {
      const otherRows = result.slice(maxRows - 1 - otherOffset);
      const otherTotal = otherRows.reduce((total, row) => total + row.amount, 0);
      const otherHits = otherRows.reduce((total, row) => total + row.hits, 0);
      const otherCrits = otherRows.reduce((total, row) => total + row.crits, 0);

      return [
        ...result.slice(0, maxRows - 1),
        {
          actorId: OTHER_SPECIAL_ID,
          spell: OTHER_SPECIAL_ID,
          type: 'Other',
          amount: otherTotal + (other?.amount ?? 0),
          hits: otherHits + (other?.hits ?? 0),
          crits: otherCrits + (other?.crits ?? 0),
        },
      ];
    } else if (other) {
      result.push(other);
    }

    return result as ThroughputSpellRow[] | ThroughputActorRow[];
  }, [events, aggregateBy, info, abilityFilter, omitOtherRow, actors, maxRows, type, unitFilter]);

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

const ThroughputTable = React.memo(ThroughputTableRaw);

export default ThroughputTable;

export const DamageTable = (props: Omit<ThroughputTableProps, 'type'>) => (
  <ThroughputTable {...props} type={EventType.Damage} />
);
export const HealingTable = (props: Omit<ThroughputTableProps, 'type'>) => (
  <ThroughputTable {...props} type={EventType.Heal} />
);

export function excludeReportPets(report: WCLReport): Set<number> {
  const pets = new Set<number>();
  for (const pet of report.friendlyPets) {
    pets.add(pet.id);
  }
  for (const pet of report.enemyPets) {
    pets.add(pet.id);
  }

  return pets;
}
