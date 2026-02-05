import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import { GetRelatedEvents } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import SpellLink from 'interface/SpellLink';
import {
  QualitativePerformance,
  evaluateQualitativePerformanceByThreshold,
} from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { PerfectColor, BadColor, GoodColor, OkColor } from 'interface/guide';
import { STAMPEDE_READY_TO_DAMAGE } from '../normalizers/HunterEventLinkNormalizers';

/* Stampede is a Pack Leader damaging ability that fires when the Stampede! buff
 * is consumed by the next Kill Command. Each stampede ticks 9 times per target hit. This analyzer tracks
 * tick coverage per stampede to evaluate positioning and target uptime.
 */

interface WindowSummary {
  start: number;
  uniqueTargets: number;
  totalDamage: number;
  actualTicks: number;
  expectedTicks: number;
  hitPercent: number;
}

const format_compact = (n: number) =>
  Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n);

const TICKS_PER_STAMPEDE_PER_TARGET = 9;

export default class StampedeAnalyzer extends Analyzer {
  private windows: WindowSummary[] = [];
  private totalStampedeCount = 0;
  private totalStampedeDamage = 0;
  private useEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HOWL_OF_THE_PACK_LEADER_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.STAMPEDE_READY_BUFF),
      this.onStampedeConsumed,
    );
  }
  private triggerAbility = this.selectedCombatant.hasTalent(TALENTS.RAPTOR_STRIKE_TALENT)
    ? TALENTS.TAKEDOWN_TALENT
    : TALENTS.BESTIAL_WRATH_TALENT;

  private gradeTicks(uniqueTargets: number, actualTicks: number): QualitativePerformance {
    if (uniqueTargets <= 0) {
      return QualitativePerformance.Fail;
    }

    return evaluateQualitativePerformanceByThreshold({
      actual: actualTicks,
      isGreaterThanOrEqual: {
        perfect: uniqueTargets * 9,
        good: uniqueTargets * 7,
        ok: uniqueTargets * 5,
      },
    });
  }

  private onStampedeConsumed = (event: RemoveBuffEvent) => {
    const damages =
      (GetRelatedEvents(event, STAMPEDE_READY_TO_DAMAGE) as DamageEvent[] | undefined) ?? [];

    type DamageEventWithInstance = DamageEvent & { targetInstance?: number };
    let totalDamage = 0;
    const targetKeys = new Set<string>();
    for (const d of damages) {
      totalDamage += d.amount + (d.absorbed ?? 0);
      const inst = (d as DamageEventWithInstance).targetInstance ?? 0;
      targetKeys.add(`${d.targetID}:${inst}`);
    }

    const uniqueTargets = targetKeys.size;
    const expectedTicks = uniqueTargets * TICKS_PER_STAMPEDE_PER_TARGET;
    const actualTicks = damages.length;
    const hitPercent = expectedTicks > 0 ? Math.min(actualTicks / expectedTicks, 1) : 0;

    const summary: WindowSummary = {
      start: event.timestamp,
      uniqueTargets,
      totalDamage,
      actualTicks,
      expectedTicks,
      hitPercent,
    };

    this.windows.push(summary);
    this.totalStampedeCount += 1;
    this.totalStampedeDamage += totalDamage;

    const perf = this.gradeTicks(uniqueTargets, actualTicks);

    const header =
      perf === QualitativePerformance.Perfect ? (
        <h5 style={{ color: PerfectColor }}>Perfect</h5>
      ) : perf === QualitativePerformance.Good ? (
        <h5 style={{ color: GoodColor }}>Good</h5>
      ) : perf === QualitativePerformance.Ok ? (
        <h5 style={{ color: OkColor }}>Okay</h5>
      ) : (
        <h5 style={{ color: BadColor }}>Fail</h5>
      );

    const tooltip = (
      <div>
        {header}
        <p>
          Targets: <strong>{uniqueTargets}</strong>
          <br />
          Damage: <strong>{format_compact(totalDamage)}</strong>
        </p>
        {expectedTicks > 0 && (
          <p>
            Ticks:{' '}
            <strong>
              {actualTicks}/{expectedTicks}
            </strong>{' '}
            (<strong>{Math.round(hitPercent * 100)}%</strong>)
          </p>
        )}
        <p>
          At: <strong>{this.owner.formatTimestamp(summary.start)}</strong>
        </p>
      </div>
    );

    this.useEntries.push({ value: perf, tooltip });
  };

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(12)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.STAMPEDE_DAMAGE}>
          <>
            <div>
              <strong>Stampedes:</strong> {this.totalStampedeCount}
            </div>
            <ItemDamageDone amount={this.totalStampedeDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.STAMPEDE_DAMAGE} />
        </strong>{' '}
        fires when a beast is spawned after using <SpellLink spell={this.triggerAbility} />. Each
        stampede ticks <strong>9 times per target</strong>. Ensure your stampede path crosses
        through enemies to maximize ticks.
      </p>
    );

    const data = (
      <CastSummaryAndBreakdown
        spell={SPELLS.STAMPEDE_DAMAGE}
        castEntries={this.useEntries}
        usesInsteadOfCasts
      />
    );

    return explanationAndDataSubsection(explanation, data);
  }
}
