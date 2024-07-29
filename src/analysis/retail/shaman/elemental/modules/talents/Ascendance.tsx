import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/shaman';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
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
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import { ReactNode } from 'react';
import SpellLink from 'interface/SpellLink';
import EmbeddedTimelineContainer, {
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import Casts from 'interface/report/Results/Timeline/Casts';

interface AscendanceTimeline {
  start: number;
  end?: number | null;
  events: AnyEvent[];
  performance?: QualitativePerformance | null;
}

interface AscendanceCooldownCast
  extends CooldownTrigger<CastEvent | ApplyBuffEvent | RefreshBuffEvent> {
  timeline: AscendanceTimeline;
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
  };

  protected currentCooldown: AscendanceCooldownCast | null = null;
  globalCooldownEnds: number = 0;

  protected abilities!: Abilities;
  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super({ spell: TALENTS.ASCENDANCE_ELEMENTAL_TALENT }, options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_ELEMENTAL_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.any, this.onCast);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ELEMENTAL_TALENT),
      this.onApplyAscendance,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ELEMENTAL_TALENT),
      this.onApplyAscendance,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ELEMENTAL_TALENT),
      this.onAscendanceEnd,
    );
    this.addEventListener(Events.fightend, this.onAscendanceEnd);
    this.addEventListener(Events.GlobalCooldown.by(SELECTED_PLAYER), this.onGlobalCooldown);
  }

  onGlobalCooldown(event: GlobalCooldownEvent) {
    this.globalCooldownEnds = event.duration + event.timestamp;
  }

  onApplyAscendance(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.currentCooldown ??= {
      event: event,
      timeline: {
        start: Math.max(event.timestamp, this.globalCooldownEnds),
        events: [],
      },
    };
  }

  onAscendanceEnd(event: AnyEvent | FightEndEvent) {
    if (this.currentCooldown) {
      this.currentCooldown.timeline.end = event.timestamp;
      this.recordCooldown(this.currentCooldown);
      this.currentCooldown = null;
    }
  }

  onCast(event: AnyEvent) {
    if (this.currentCooldown) {
      if (event.type === EventType.Cast && !event.globalCooldown) {
        return;
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

  get averageLavaBurstCasts() {
    return this.spellCasts.length / this.casts.length;
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
    const hasEB = this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT);
    const totalCasts = this.spellCasts;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            With a uptime of: {formatPercentage(this.AscendanceUptime)} %<br />
            Casts while Ascendance was up:
            <ul>
              <li>
                Lava Burst:{' '}
                {totalCasts.filter((e) => e.ability.guid === TALENTS.LAVA_BURST_TALENT.id).length}
              </li>
              {(hasEB && (
                <li>
                  Elemental Blast:{' '}
                  {
                    totalCasts.filter(
                      (e) => e.ability.guid === TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
                    ).length
                  }
                </li>
              )) || (
                <li>
                  Earth Shock:{' '}
                  {
                    totalCasts.filter((e) => e.ability.guid === TALENTS.EARTH_SHOCK_TALENT.id)
                      .length
                  }
                </li>
              )}
              <li>
                Other Spells:{' '}
                {
                  totalCasts.filter(
                    (e) =>
                      ![
                        TALENTS.LAVA_BURST_TALENT.id,
                        TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
                        TALENTS.EARTH_SHOCK_TALENT.id,
                      ].includes(e.ability.guid),
                  ).length
                }
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT}>
          <>
            On average {formatNumber(this.averageLavaBurstCasts)} Lava Bursts cast during
            Ascendance.
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  description(): ReactNode {
    return (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT} />
          </strong>{' '}
          is a powerful cooldown
        </p>
      </>
    );
  }

  explainPerformance(cast: AscendanceCooldownCast): SpellUse {
    const checklistItems: ChecklistUsageInfo[] = [
      this.explainLavaBurstPerformance(cast),
      this.explainSpenderPerformance(cast),
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

  explainSpenderPerformance(cast: AscendanceCooldownCast) {
    const spendersCast = cast.timeline.events.filter(
      (e) => e.type === EventType.BeginCast && maelstromSpenders.includes(e.ability.guid),
    ).length;
    return {
      check: 'spender-casts',
      timestamp: cast.event.timestamp,
      performance: spendersCast === 0 ? QualitativePerformance.Perfect : QualitativePerformance.Ok,
      summary: <>Maelstrom spenders cast: {spendersCast}</>,
      details: (
        <div>
          You cast {spendersCast} maelstrom spender(s) during ascendance.{' '}
          {spendersCast !== 0 && (
            <>
              Try to minimise the number of non-
              <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> spells cast during{' '}
              <SpellLink spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT} />
            </>
          )}
        </div>
      ),
    };
  }

  explainLavaBurstPerformance(cast: AscendanceCooldownCast) {
    const lvbCasts = cast.timeline.events.filter(
      (e) => e.type === EventType.BeginCast && e.ability.guid === TALENTS.LAVA_BURST_TALENT.id,
    ).length;
    return {
      check: 'lvb-casts',
      timestamp: cast.event.timestamp,
      performance: lvbCasts > 0 ? QualitativePerformance.Perfect : QualitativePerformance.Ok,
      summary: (
        <>
          <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> casts: {lvbCasts}
        </>
      ),
      details: (
        <div>
          You cast {lvbCasts} <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> during ascendance.
        </div>
      ),
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

export default Ascendance;
