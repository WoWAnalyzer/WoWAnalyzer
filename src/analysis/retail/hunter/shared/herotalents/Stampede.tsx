import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, AnyEvent } from 'parser/core/Events';
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
  getLowestPerf,
} from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { PerfectColor, BadColor, GoodColor, OkColor } from 'interface/guide';
import {
  LFTF_TO_STAMPEDE_DAMAGE,
  LFTF_TO_STAMPEDE_BUFF_APPLY,
  LFTF_TO_STAMPEDE_BUFF_REFRESH,
} from '../normalizers/HunterEventLinkNormalizers';

/* Stampede is a damaging ability that is spawned from the Pack Leader TWW S3 4piece bonus.
 * When a Howl beast is spawned during Lead From The Front, a 12s buff that is applied when
 * you use Coordinated Assault or Bestial Wrath, a stampede is spawned between your target
 * and the player. It is possible to spawn 2 stampedes in a single window by delaying your CA
 * or BW and is a damage gain in nearly every situation.
 * This analyzer monitors the Lead from the Front windows to gather the stampede damage.
 *
 * As lead from the front has no other considerations to play, this analyzer is relevent only during TWW s3
 * and can be retired after the set bonus is disabled in Midnight.
 */

interface WindowSummary {
  start: number;
  end: number;
  stampedeCount: number;
  uniqueTargets: number;
  totalDamage: number;
  actualTicks: number;
  expectedTicks: number;
  hitPercent: number;
  missedTicks: number;
}

const format_compact = (n: number) =>
  Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n);

const TICKS_PER_STAMPEDE_PER_TARGET = 9;
// We attribute Stampede damage to a short window starting at each apply/refresh.
// This covers the 4s base duration + approximate travel time from summon to first impact.
const INSTANCE_WINDOW_MS = 7000;
const GRACE_MS = 1500;

export default class StampedeAnalyzer extends Analyzer {
  private windows: WindowSummary[] = [];
  private totalStampedeCount = 0;
  private totalStampedeDamage = 0;
  private encounterUniqueTargets = new Set<string>();
  private useEntries: BoxRowEntry[] = [];
  private damageCooldown = this.selectedCombatant.hasTalent(TALENTS.COORDINATED_ASSAULT_TALENT)
    ? TALENTS.COORDINATED_ASSAULT_TALENT
    : TALENTS.BESTIAL_WRATH_TALENT;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HOWL_OF_THE_PACK_LEADER_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LEAD_FROM_THE_FRONT),
      this.on_lftf_apply,
    );
  }

  // Usage score for an LFtF window: expect 2 Stampedes, 1 is "ok", 0 is fail.
  private grade_usage(stampede_count: number): QualitativePerformance {
    return evaluateQualitativePerformanceByThreshold({
      actual: stampede_count,
      isGreaterThanOrEqual: {
        perfect: 2,
        ok: 1,
      },
    });
  }

  private grade_coverage(
    unique_targets: number,
    stampede_count: number,
    actual_ticks: number,
  ): QualitativePerformance {
    const expected = unique_targets * TICKS_PER_STAMPEDE_PER_TARGET * stampede_count;

    if (expected <= 0) {
      return QualitativePerformance.Fail;
    }

    if (unique_targets === 1) {
      return evaluateQualitativePerformanceByThreshold({
        actual: actual_ticks,
        isGreaterThanOrEqual: {
          perfect: expected,
          ok: expected - stampede_count,
        },
      });
    }

    const perfect_ticks = expected;
    const good_ticks = Math.ceil(expected * 0.75);
    const ok_ticks = Math.floor(expected * 0.5) + 1;

    return evaluateQualitativePerformanceByThreshold({
      actual: actual_ticks,
      isGreaterThanOrEqual: {
        perfect: perfect_ticks,
        good: good_ticks,
        ok: ok_ticks,
      },
    });
  }

  // Stampede triggers a buff, which can refresh if we double stampede early
  // or provide it's own buff. The damage ticks overlap and so it is impossible
  // to parse what damage belongs to which on a refresh
  // Normalizer helps to count stampedes.
  private on_lftf_apply = (event: AnyEvent) => {
    const lftfStart = event.timestamp;
    const lftfEnd = lftfStart + 12000;
    // Upper bound for including late Stampede impacts tied to this LFtF.
    const link_end = lftfStart + 20000;

    const damages =
      (GetRelatedEvents(event, LFTF_TO_STAMPEDE_DAMAGE) as DamageEvent[] | undefined) ?? [];
    const applies = (GetRelatedEvents(event, LFTF_TO_STAMPEDE_BUFF_APPLY) ?? []).sort(
      (a, b) => a.timestamp - b.timestamp,
    );
    const refreshes = (GetRelatedEvents(event, LFTF_TO_STAMPEDE_BUFF_REFRESH) ?? []).sort(
      (a, b) => a.timestamp - b.timestamp,
    );

    const stamp_starts = [...applies, ...refreshes]
      .filter((e) => e.timestamp <= lftfStart + 12000)
      .sort((a, b) => a.timestamp - b.timestamp);

    const stampede_count = stamp_starts.length;

    const raw_intervals = stamp_starts.map((s) => {
      const s_ts = s.timestamp;
      const e_ts = Math.min(s_ts + INSTANCE_WINDOW_MS + GRACE_MS, link_end);
      return [s_ts, e_ts] as [number, number];
    });

    const intervals = raw_intervals;

    const dmg_in_intervals: DamageEvent[] =
      intervals.length === 0
        ? []
        : damages.filter((d) => intervals.some(([a, b]) => d.timestamp >= a && d.timestamp <= b));

    type DamageEventWithInstance = DamageEvent & { targetInstance?: number };
    let window_damage = 0;
    const targetKeys = new Set<string>();
    for (const d of dmg_in_intervals) {
      window_damage += d.amount + (d.absorbed ?? 0);
      const inst = (d as DamageEventWithInstance).targetInstance ?? 0;
      targetKeys.add(`${d.targetID}:${inst}`);
    }

    const uniqueTargets = targetKeys.size;
    const expectedTicks = uniqueTargets * TICKS_PER_STAMPEDE_PER_TARGET * stampede_count;
    const actualTicks = dmg_in_intervals.length;
    const hitPercentage = expectedTicks > 0 ? Math.min(actualTicks / expectedTicks, 1) : 0;
    const missedTicks = Math.max(expectedTicks - actualTicks, 0);

    const summary: WindowSummary = {
      start: lftfStart,
      end: lftfEnd,
      stampedeCount: stampede_count,
      uniqueTargets: uniqueTargets,
      totalDamage: window_damage,
      actualTicks: actualTicks,
      expectedTicks: expectedTicks,
      hitPercent: hitPercentage,
      missedTicks: missedTicks,
    };

    this.windows.push(summary);
    this.totalStampedeCount += stampede_count;
    this.totalStampedeDamage += window_damage;
    for (const k of targetKeys) {
      this.encounterUniqueTargets.add(k);
    }

    const usage_grade = this.grade_usage(stampede_count);
    const coverage_grade = this.grade_coverage(uniqueTargets, stampede_count, actualTicks);
    const perf = getLowestPerf([usage_grade, coverage_grade]);

    const header =
      perf === QualitativePerformance.Perfect ? (
        <h5 style={{ color: PerfectColor }}>Perfect window</h5>
      ) : perf === QualitativePerformance.Good ? (
        <h5 style={{ color: GoodColor }}>Good window</h5>
      ) : perf === QualitativePerformance.Ok ? (
        <h5 style={{ color: OkColor }}>Okay window</h5>
      ) : (
        <h5 style={{ color: BadColor }}>
          {usage_grade === QualitativePerformance.Ok ? 'Bad window' : 'Fail window'}
        </h5>
      );

    const tooltip = (
      <div>
        {header}
        <p>
          Stampedes: <strong>{stampede_count}</strong> | Targets: <strong>{uniqueTargets}</strong>
          <br />
          Damage (window): <strong>{format_compact(window_damage)}</strong>
        </p>
        {expectedTicks > 0 && (
          <p>
            Ticks hit:{' '}
            <strong>
              {actualTicks}/{expectedTicks}
            </strong>{' '}
            (<strong>{Math.round(hitPercentage * 100)}%</strong> hit,&nbsp;
            <strong>{Math.max(0, 100 - Math.round(hitPercentage * 100))}%</strong> missed)
          </p>
        )}
        <p>
          Window: <strong>{this.owner.formatTimestamp(summary.start)}</strong> →{' '}
          <strong>{this.owner.formatTimestamp(summary.end)}</strong>
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
        <BoringSpellValueText spell={SPELLS.LEAD_FROM_THE_FRONT}>
          <>
            <div>
              <strong>Total Stampedes in LFtF:</strong> {this.totalStampedeCount}
            </div>
            <ItemDamageDone amount={this.totalStampedeDamage} />
            <div>
              <strong>Unique targets (encounter):</strong> {this.encounterUniqueTargets.size}
            </div>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsectionStampede(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.TWW_STAMPEDE_DAMAGE} />
        </strong>
        's occur from beast spawns during
        <strong>
          <SpellLink spell={SPELLS.LEAD_FROM_THE_FRONT} />
        </strong>{' '}
        windows should contain <strong>2 Stampedes</strong>. You should hold{' '}
        <SpellLink spell={this.damageCooldown} /> briefly so it aligns inside a Lead from the Front
        window.
      </p>
    );

    const data = (
      <CastSummaryAndBreakdown
        spell={SPELLS.TWW_STAMPEDE_DAMAGE}
        castEntries={this.useEntries}
        usesInsteadOfCasts
      />
    );

    return explanationAndDataSubsection(explanation, data);
  }
}
