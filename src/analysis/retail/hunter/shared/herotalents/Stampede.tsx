// src/analysis/hunter/survival/modules/Stampede.ts
import React from 'react';
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
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { PerfectColor, BadColor, GoodColor, OkColor } from 'interface/guide';
import {
  LFTF_TO_STAMPEDE_DAMAGE,
  LFTF_TO_STAMPEDE_BUFF_APPLY,
  LFTF_TO_STAMPEDE_BUFF_REFRESH,
} from '../normalizers/HunterEventLinkNormalizers';

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
const INSTANCE_WINDOW_MS = 7000; // Stampede is a 4s duration + travel time of the animals
const GRACE_MS = 1500;

const merge_intervals = (intervals: [number, number][]): [number, number][] => {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const [s, e] = sorted[i];
    const last = merged[merged.length - 1];
    if (s <= last[1]) {
      if (e > last[1]) last[1] = e;
    } else {
      merged.push([s, e]);
    }
  }
  return merged;
};

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
    if (!this.active) return;
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LEAD_FROM_THE_FRONT),
      this.on_lftf_apply,
    );
  }

  private grade_usage(stampede_count: number): QualitativePerformance {
    if (stampede_count >= 2) return QualitativePerformance.Perfect;
    if (stampede_count === 1) return QualitativePerformance.Ok;
    return QualitativePerformance.Fail;
  }

  private grade_coverage(
    unique_targets: number,
    stampede_count: number,
    actual_ticks: number,
  ): QualitativePerformance {
    const expected = unique_targets * TICKS_PER_STAMPEDE_PER_TARGET * stampede_count;
    if (expected <= 0) return QualitativePerformance.Fail;

    if (unique_targets === 1) {
      if (actual_ticks >= expected) return QualitativePerformance.Perfect;
      if (actual_ticks >= expected - stampede_count) return QualitativePerformance.Ok;
      return QualitativePerformance.Fail;
    }
    const ratio = actual_ticks / expected;
    if (ratio == 1) return QualitativePerformance.Perfect;
    if (ratio >= 0.75) return QualitativePerformance.Good;
    if (ratio > 0.5) return QualitativePerformance.Ok;
    return QualitativePerformance.Fail;
  }

  private worst(a: QualitativePerformance, b: QualitativePerformance): QualitativePerformance {
    const rank = new Map([
      [QualitativePerformance.Perfect, 0],
      [QualitativePerformance.Good, 1],
      [QualitativePerformance.Ok, 2],
      [QualitativePerformance.Fail, 3],
    ]);
    return rank.get(a)! >= rank.get(b)! ? a : b;
  }

  private on_lftf_apply = (event: AnyEvent) => {
    const lftfStart = event.timestamp;
    const lftfEnd = lftfStart + 12000;
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
    const intervals = merge_intervals(raw_intervals);

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
      const key = `${d.targetID}:${inst}`;
      targetKeys.add(key);
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
    for (const k of targetKeys) this.encounterUniqueTargets.add(k);

    const usage_grade = this.grade_usage(stampede_count);
    const coverage_grade = this.grade_coverage(uniqueTargets, stampede_count, actualTicks);
    const perf = this.worst(usage_grade, coverage_grade);

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
          <SpellLink spell={SPELLS.LEAD_FROM_THE_FRONT} />
        </strong>{' '}
        windows should contain <strong>2 Stampedes</strong>. You should hold{' '}
        <SpellLink spell={this.damageCooldown} /> for a short amount of time to ensure it becomes
        available during a Lead from the Front window.
      </p>
    );

    const data = (
      <CastSummaryAndBreakdown
        spell={SPELLS.LEAD_FROM_THE_FRONT}
        castEntries={this.useEntries}
        usesInsteadOfCasts
      />
    );

    return explanationAndDataSubsection(explanation, data);
  }
}
