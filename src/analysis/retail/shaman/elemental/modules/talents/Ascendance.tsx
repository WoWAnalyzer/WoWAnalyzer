import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/shaman';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import Abilities from '../Abilities';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  BeginCastEvent,
  CastEvent,
  EventType,
  FightEndEvent,
  GlobalCooldownEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import {
  evaluateQualitativePerformanceByThreshold,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import { ReactNode } from 'react';
import SpellLink from 'interface/SpellLink';
import EmbeddedTimelineContainer, {
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import Casts from 'interface/report/Results/Timeline/Casts';
import TalentSpellText from 'parser/ui/TalentSpellText';
import Uptime from 'interface/icons/Uptime';
import MaelstromTracker from '../resources/MaelstromTracker';
import ResourceLink from 'interface/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Spell from 'common/SPELLS/Spell';

interface AscendanceTimeline {
  start: number;
  end?: number | null;
  events: AnyEvent[];
  performance?: QualitativePerformance | null;
}

interface AscendanceCooldownCast
  extends CooldownTrigger<CastEvent | ApplyBuffEvent | RefreshBuffEvent> {
  timeline: AscendanceTimeline;
  endingMaelstrom: number;
}

interface SpenderCasts {
  count: number;
  noProcBeforeEnd?: boolean | undefined;
}

interface Spender {
  spell: Spell & { maelstromCost: number };
  costReduction: number;
}

const maelstromSpenders: number[] = [
  TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
  TALENTS.EARTH_SHOCK_TALENT.id,
  TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT.id,
  TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT.id,
];

class Ascendance extends MajorCooldown<AscendanceCooldownCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    abilities: Abilities,
    enemies: Enemies,
    spellUsable: SpellUsable,
    maelstromTracker: MaelstromTracker,
  };

  protected abilities!: Abilities;
  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;
  protected maelstromTracker!: MaelstromTracker;

  protected castsBeforeAscendanceProc: SpenderCasts[] = [];
  protected currentCooldown: AscendanceCooldownCast | null = null;
  protected globalCooldownEnds: number = 0;
  protected ascendanceWasCast: boolean = false;
  protected spender: Spender = {
    spell: TALENTS.EARTH_SHOCK_TALENT,
    costReduction: this.selectedCombatant.hasTalent(TALENTS.EYE_OF_THE_STORM_TALENT) ? 5 : 0,
  };

  constructor(options: Options) {
    super({ spell: TALENTS.ASCENDANCE_ELEMENTAL_TALENT }, options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_ELEMENTAL_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT);

    if (this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT)) {
      this.spender.spell = TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT;
      this.spender.costReduction = this.selectedCombatant.hasTalent(TALENTS.EYE_OF_THE_STORM_TALENT)
        ? 10
        : 0;
    }

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ELEMENTAL_TALENT),
      this.onApplyAscendance,
    );
    if (this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT)) {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ELEMENTAL_TALENT),
        this.onApplyAscendance,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ELEMENTAL_TALENT),
        this.onApplyAscendance,
      );
    }
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ELEMENTAL_TALENT),
      this.onAscendanceEnd,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);

    this.addEventListener(Events.any.by(SELECTED_PLAYER), this.onCast);

    if (this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT)) {
      this.addEventListener(
        Events.cast
          .by(SELECTED_PLAYER)
          .spell([
            TALENTS.EARTH_SHOCK_TALENT,
            TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT,
            TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT,
            TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT,
          ]),
        this.onProcEligibleCast,
      );
    }
  }

  onGlobalCooldown(event: GlobalCooldownEvent) {
    this.globalCooldownEnds = event.duration + event.timestamp;
  }

  onApplyAscendance(event: CastEvent | ApplyBuffEvent | RefreshBuffEvent) {
    if (event.type === EventType.Cast) {
      this.ascendanceWasCast = true;
    } else if (this.ascendanceWasCast && this.currentCooldown) {
      this.ascendanceWasCast = false;
      return;
    }

    if (!this.ascendanceWasCast && event.type !== EventType.Cast) {
      this.castsBeforeAscendanceProc.push({ count: 0 });
    }

    if (!this.currentCooldown) {
      this.currentCooldown = {
        event: event,
        timeline: {
          start: Math.max(event.timestamp, this.globalCooldownEnds),
          events: [],
        },
        endingMaelstrom: this.maelstromTracker.current,
      };
    }
  }

  onAscendanceEnd(event: AnyEvent | FightEndEvent) {
    if (this.currentCooldown) {
      this.currentCooldown.timeline.end = event.timestamp;
      // this.currentCooldown.endingMaelstrom = this.maelstromTracker.current;
      this.recordCooldown(this.currentCooldown);
      this.currentCooldown = null;
    }
  }

  onFightEnd(event: FightEndEvent) {
    const cast = this.castsBeforeAscendanceProc.at(-1);
    if (cast) {
      cast.noProcBeforeEnd = true;
    }
    this.onAscendanceEnd(event);
  }

  onProcEligibleCast(event: CastEvent) {
    this.castsBeforeAscendanceProc.at(-1)!.count += 1;
  }

  onCast(event: AnyEvent) {
    if (this.currentCooldown) {
      if (event.type === EventType.Cast && !event.globalCooldown) {
        return;
      }
      if (event.type === EventType.Cast) {
        this.currentCooldown.endingMaelstrom = this.maelstromTracker.current;
      }
      this.currentCooldown.timeline.events.push(event);
    }
  }

  get AscendanceUptime() {
    return (
      this.selectedCombatant.getBuffUptime(TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id) /
      this.owner.fightDuration
    );
  }

  get spellCasts(): BeginCastEvent[] {
    return this.casts.flatMap((c) =>
      c.timeline.events.filter((e) => e.type === EventType.BeginCast),
    ) as BeginCastEvent[];
  }

  get suggestionThresholds() {
    const otherCasts = this.spellCasts.filter(
      (e) => ![TALENTS.LAVA_BURST_TALENT.id, ...maelstromSpenders].includes(e.ability.guid),
    ).length;
    return {
      actual: otherCasts,
      isGreaterThan: {
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    if (this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT)) {
      // don't include casts that didn't lead to a proc in casts per proc statistic
      const castsBeforeAscendanceProc = this.castsBeforeAscendanceProc
        .filter((cast: SpenderCasts) => !cast.noProcBeforeEnd && cast.count > 0)
        .map((cast: SpenderCasts) => cast.count);
      const minToProc = Math.min(...castsBeforeAscendanceProc);
      const maxToProc = Math.max(...castsBeforeAscendanceProc);
      const median = getMedian(castsBeforeAscendanceProc)!;
      // do include them in overall casts to get the expected procs based on simulation results
      const totalCasts = this.castsBeforeAscendanceProc.reduce(
        (total, current: SpenderCasts) => (total += current.count),
        0,
      );
      return (
        <Statistic
          position={STATISTIC_ORDER.OPTIONAL()}
          category={STATISTIC_CATEGORY.TALENTS}
          size="flexible"
          tooltip={
            castsBeforeAscendanceProc.length > 0 ? (
              <>
                <ul>
                  <li>Min casts before proc: {minToProc}</li>
                  <li>Max casts before proc: {maxToProc}</li>
                  <li>Total casts: {totalCasts}</li>
                </ul>
              </>
            ) : null
          }
        >
          <TalentSpellText talent={TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT}>
            {castsBeforeAscendanceProc.length > 0 ? (
              <>
                <div>
                  {formatNumber(median)} <small>casts per proc</small>
                </div>
                <div>
                  {formatNumber(
                    this.castsBeforeAscendanceProc.filter((c) => !c.noProcBeforeEnd).length,
                  )}{' '}
                  <small>
                    <SpellLink spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT} /> procs
                  </small>
                </div>
                <div>
                  <Uptime />{' '}
                  {formatPercentage(
                    this.selectedCombatant.getBuffUptime(TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id) /
                      this.owner.fightDuration,
                    2,
                  )}
                  % <small>uptime</small>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 20 }}>No procs after {totalCasts} casts.</div>
              </>
            )}
          </TalentSpellText>
        </Statistic>
      );
    }
  }

  description(): ReactNode {
    return (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT} />
          </strong>{' '}
          analysis is a work in progress. Additional details will be added at a later date.
        </p>
      </>
    );
  }

  explainPerformance(cast: AscendanceCooldownCast): SpellUse {
    const checklistItems: ChecklistUsageInfo[] = [
      this.explainSpenderPerformance(cast),
      this.explainEndingMaelstrom(cast),
    ];

    const timeline = (
      <div
        style={{
          overflowX: 'scroll',
        }}
      >
        <EmbeddedTimelineContainer
          secondWidth={60}
          secondsShown={(cast.timeline.end! - cast.timeline.start) / 1000}
        >
          <SpellTimeline>
            <Casts
              start={cast.timeline.start}
              movement={undefined}
              secondWidth={60}
              events={cast.timeline.events}
            />
          </SpellTimeline>
        </EmbeddedTimelineContainer>
      </div>
    );

    return {
      event: cast.event,
      checklistItems: checklistItems,
      performance: QualitativePerformance.Perfect,
      performanceExplanation: 'Usage',
      extraDetails: timeline,
    };
  }

  get spenderCost() {
    return this.spender.spell.maelstromCost - this.spender.costReduction;
  }

  explainEndingMaelstrom(cast: AscendanceCooldownCast): ChecklistUsageInfo {
    return {
      check: 'ending-maelstrom',
      timestamp: cast.event.timestamp,
      performance: evaluateQualitativePerformanceByThreshold({
        actual: cast.endingMaelstrom,
        isLessThan: {
          perfect: this.spenderCost,
          ok: this.spenderCost + 1,
        },
      }),
      summary: (
        <>
          Ended with {cast.endingMaelstrom} <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} />
        </>
      ),
      details: (
        <div>
          You ended <SpellLink spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT} /> with{' '}
          {cast.endingMaelstrom} <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} />.{' '}
          {cast.endingMaelstrom > this.spenderCost ? (
            <>
              You could have cast {Math.floor(cast.endingMaelstrom / this.spenderCost)} more{' '}
              <SpellLink spell={this.spender.spell} />
              's
            </>
          ) : null}
        </div>
      ),
    };
  }

  explainSpenderPerformance(cast: AscendanceCooldownCast) {
    const spendersCast = cast.timeline.events.filter(
      (e) => e.type === EventType.BeginCast && maelstromSpenders.includes(e.ability.guid),
    ).length;
    return {
      check: 'spender-casts',
      timestamp: cast.event.timestamp,
      performance: QualitativePerformance.Perfect,
      summary: <>Maelstrom spenders cast: {spendersCast}</>,
      details: <div>You cast {spendersCast} maelstrom spender(s) during ascendance.</div>,
    };
  }

  get guideSubsection() {
    return (
      this.active && (
        <>
          <CooldownUsage analyzer={this} title="Ascendance" />
        </>
      )
    );
  }

  suggestions(when: When) {
    const abilities = `Lava Burst and ${
      this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT)
        ? ` Elemental Blast `
        : ` Earth Shock`
    }`;
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(<span>Maximize your damage during ascendance by only using {abilities}.</span>)
        .icon(TALENTS.ASCENDANCE_ELEMENTAL_TALENT.icon)
        .actual(`${actual} other casts during Ascendence`)
        .recommended(`Only cast ${abilities} during Ascendence.`),
    );
  }
}

function getMedian(values: number[]): number | undefined {
  if (values.length > 0) {
    values.sort(function (a, b) {
      return a - b;
    });
    const half = Math.floor(values.length / 2);
    if (values.length % 2) {
      return values[half];
    }
    return (values[half - 1] + values[half]) / 2.0;
  }
}

export default Ascendance;
