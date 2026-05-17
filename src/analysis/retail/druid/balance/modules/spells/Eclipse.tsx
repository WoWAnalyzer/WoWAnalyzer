import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, EventType } from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';
import { SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { cdDuration, cdSpell } from 'analysis/retail/druid/balance/constants';
import AlwaysBeCasting from 'analysis/retail/druid/balance/modules/features/AlwaysBeCasting';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { mergeTimePeriods } from 'parser/core/mergeTimePeriods';
import { TALENTS_DRUID } from 'common/TALENTS';
import { CastDetail, CastOverview, StatisticData } from 'interface/guide/components';
import { SpellSequence, type CastInSequence } from 'interface/guide/components/CastSequence';
import { type PerCastData } from 'interface/guide/components/CastDetail';
import { evaluateQualitativePerformanceByThreshold } from 'parser/ui/QualitativePerformance';
import { getEclipseAndMainSpellBuffWindows } from 'analysis/retail/druid/balance/modules/guide/OffensiveTimeline/Helper';

/**
 * **Eclipse**
 * Spec Talent
 *
 * Active ability (32 sec cooldown, 15 sec duration). Empowers either Nature or Arcane spells.
 * Casting Wrath primes Solar Eclipse; casting Starfire primes Lunar Eclipse.
 * Both modes share a button and cooldown.
 *
 * Eclipse (Solar)
 * Nature spells deal 15% additional damage and Wrath damage is increased by 40%.
 *
 * Eclipse (Lunar)
 * Arcane spells deal 15% additional damage and Starfire damage is increased by 40%.
 */
const ECLIPSE_COOLDOWN_MS = 32000;
const ECLIPSE_DURATION_MS = 15000;

const deps = {
  alwaysBeCasting: AlwaysBeCasting,
  eventHistory: EventHistory,
};

export default class Eclipse extends Analyzer.withDependencies(deps) {
  private eclipseCastEvents: CastEvent[] = [];
  private cdCastEvents: CastEvent[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.SOLAR_ECLIPSE, SPELLS.LUNAR_ECLIPSE]),
      this.onEclipseCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(cdSpell(this.selectedCombatant)),
      this.onCdCast,
    );
  }

  private onEclipseCast(event: CastEvent) {
    this.eclipseCastEvents.push(event);
  }

  private onCdCast(event: CastEvent) {
    this.cdCastEvents.push(event);
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS_DRUID.ECLIPSE_TALENT} />
          </strong>{' '}
          has a 32-second cooldown, lasts 15 seconds, and dramatically increases your damage. Cast
          it as often as possible, while making sure you align it with other Cooldowns (if
          possible).
        </p>
        <p>It is important to choose the correct Eclipse:</p>
        <ul>
          <li>
            3+ stacked targets → <SpellLink spell={SPELLS.ECLIPSE_LUNAR} />
          </li>
          <li>
            1 to 2 targets → <SpellLink spell={SPELLS.ECLIPSE_SOLAR} />
          </li>
        </ul>
        {this.selectedCombatant.hasTalent(TALENTS_DRUID.LUNAR_CALLING_TALENT) && (
          <p>
            <strong>
              <SpellLink spell={TALENTS_DRUID.LUNAR_CALLING_TALENT} /> talented:{' '}
            </strong>
            This talent restricts you from casting <SpellLink spell={SPELLS.ECLIPSE_SOLAR} />
          </p>
        )}
        {!this.selectedCombatant.hasTalent(TALENTS_DRUID.LUNAR_CALLING_TALENT) && (
          <>
            <p>Your last filler cast determines which Eclipse you enter:</p>
            <ul>
              <li>
                <SpellLink spell={SPELLS.WRATH} /> (single target) →{' '}
                <SpellLink spell={SPELLS.ECLIPSE_SOLAR} />
              </li>
              <li>
                <SpellLink spell={SPELLS.STARFIRE} /> (cleave) →{' '}
                <SpellLink spell={SPELLS.ECLIPSE_LUNAR} />
              </li>
            </ul>
          </>
        )}
        {this.selectedCombatant.hasTalent(TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT) && (
          <>
            <hr />
            <p>
              <strong>
                <SpellLink spell={cdSpell(this.selectedCombatant)} /> talented
              </strong>
            </p>
            <p>
              This is a very important cooldown, as it gives you both{' '}
              <SpellLink spell={SPELLS.ECLIPSE_SOLAR} /> and{' '}
              <SpellLink spell={SPELLS.ECLIPSE_LUNAR} /> for its duration. Your other cooldowns
              should be aligned with this spell as a top priority.
            </p>
            <p>
              Ensure you will have full target uptime during its duration (do not use it when it
              will be interrupted by a fight mechanic).
            </p>
            <p>Do not clip an active Eclipse window while using it !</p>
          </>
        )}
      </>
    );

    const data = (
      <RoundedPanel>
        <CastOverview spell={TALENTS_DRUID.ECLIPSE_TALENT} stats={this.buildStats()} />
        <CastDetail title="Eclipse Casts" casts={this.buildEclipsePerCastData()} />
        {this.selectedCombatant.hasTalent(TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT) && (
          <CastDetail title={`${this.cdShortName} Casts`} casts={this.buildCdPerCastData()} />
        )}
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  private get cdShortName(): string {
    return this.selectedCombatant.hasTalent(TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT)
      ? 'Incarnation'
      : cdSpell(this.selectedCombatant).name;
  }

  private buildStats(): StatisticData[] {
    return [
      {
        value: `${formatPercentage(this.percentEclipseUptime, 1)}%`,
        label: 'Eclipse Uptime',
        tooltip: <>Combined uptime of Solar Eclipse, Lunar Eclipse, and Celestial Alignment</>,
      },
      {
        value: `${formatPercentage(this.percentEclipseEfficiency, 1)}%`,
        label: 'Eclipse Efficiency',
        tooltip: (
          <>
            Percentage of the fight during which Solar Eclipse had no charges available (active or
            on cooldown). Higher is better.
          </>
        ),
      },
      ...(this.selectedCombatant.hasTalent(TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT)
        ? [
            {
              value: `${formatPercentage(this.percentMainCdEfficiency, 1)}%`,
              label: `${this.cdShortName} Efficiency`,
              tooltip: (
                <>
                  Percentage of the fight during which {this.cdShortName} had no charges available
                  (active or on cooldown). Higher is better.
                </>
              ),
            } as StatisticData,
          ]
        : []),
    ];
  }

  private get percentEclipseUptime(): number {
    const fightStart = this.owner.fight.start_time;
    const fightEnd = this.owner.fight.end_time;
    const buffWindows = getEclipseAndMainSpellBuffWindows(
      this.selectedCombatant,
      fightStart,
      fightEnd,
    );
    const allEclipseUptimes = buffWindows
      .filter((w) => w.spellId === SPELLS.ECLIPSE_SOLAR.id || w.spellId === SPELLS.ECLIPSE_LUNAR.id)
      .map((w) => ({
        start: w.startTime + fightStart,
        end: w.endTime + fightStart,
      }));
    const combinedUptime = mergeTimePeriods(allEclipseUptimes, fightEnd).reduce(
      (acc, up) => acc + up.end - up.start,
      0,
    );
    return combinedUptime / (fightEnd - fightStart);
  }

  private get percentEclipseEfficiency(): number {
    const fightEnd = this.owner.fight.end_time;
    const cooldownPeriods = this.eclipseCastEvents.map((e) => ({
      // Add 200ms to remove the cast of Eclipse itself
      start: e.timestamp + 200,
      end: Math.min(e.timestamp + ECLIPSE_COOLDOWN_MS, fightEnd),
    }));
    const totalOnCooldown = mergeTimePeriods(cooldownPeriods, fightEnd).reduce(
      (acc, p) => acc + p.end - p.start,
      0,
    );
    return totalOnCooldown / (fightEnd - this.owner.fight.start_time);
  }

  private get percentMainCdEfficiency(): number {
    const fightEnd = this.owner.fight.end_time;
    const mainCdDuration = cdDuration(this.selectedCombatant) * 1000;
    const cooldownPeriods = this.cdCastEvents.map((e) => ({
      // Add 200ms to remove the cast of Incarn/CA itself
      start: e.timestamp + 200,
      end: Math.min(e.timestamp + mainCdDuration, fightEnd),
    }));
    const totalOnCooldown = mergeTimePeriods(cooldownPeriods, fightEnd).reduce(
      (acc, p) => acc + p.end - p.start,
      0,
    );
    return totalOnCooldown / (fightEnd - this.owner.fight.start_time);
  }

  private buildEclipsePerCastData(): PerCastData[] {
    const fightStart = this.owner.fight.start_time;
    const fightEnd = this.owner.fight.end_time;
    const buffWindows = getEclipseAndMainSpellBuffWindows(
      this.selectedCombatant,
      fightStart,
      fightEnd,
    );
    const solarBuffPeriods = buffWindows
      .filter((w) => w.spellId === SPELLS.ECLIPSE_SOLAR.id)
      .map((w) => ({ start: w.startTime + fightStart, end: w.endTime + fightStart }));
    const lunarBuffPeriods = buffWindows
      .filter((w) => w.spellId === SPELLS.ECLIPSE_LUNAR.id)
      .map((w) => ({ start: w.startTime + fightStart, end: w.endTime + fightStart }));

    return this.eclipseCastEvents.map((event) => {
      const windowEnd = Math.min(event.timestamp + ECLIPSE_DURATION_MS, this.owner.fight.end_time);
      const activeTime = this.deps.alwaysBeCasting.getActiveTimePercentageInWindow(
        // Add 200ms to remove the cast of Eclipse itself
        event.timestamp + 200,
        windowEnd,
      );
      const activeTimePerf = evaluateQualitativePerformanceByThreshold({
        actual: activeTime,
        isGreaterThanOrEqual: { perfect: 0.95, good: 0.9, ok: 0.8 },
      });

      const isSolar = event.ability.guid === SPELLS.SOLAR_ECLIPSE.id;
      const buffPeriod = (isSolar ? solarBuffPeriods : lunarBuffPeriods).find(
        (p) => Math.abs(p.start - event.timestamp) < 1000,
      );
      const durationMs = buffPeriod
        ? buffPeriod.end - buffPeriod.start
        : windowEnd - event.timestamp;

      const castSequence: CastInSequence[] = this.deps.eventHistory
        .getEvents([EventType.Cast], {
          searchBackwards: false,
          // Add 200ms to remove the cast of Eclipse itself
          startTimestamp: event.timestamp + 200,
          duration: windowEnd - event.timestamp,
        })
        .map((e) => ({
          timestamp: e.timestamp,
          spellId: e.ability.guid,
          spellName: e.ability.name,
          icon: e.ability.abilityIcon.replace('.jpg', ''),
          performance: undefined,
        }));

      return {
        performance: activeTimePerf,
        stats: [
          {
            value: `${formatPercentage(activeTime, 1)}%`,
            label: 'Active Time',
            tooltip: <>Percentage of time spent actively casting during this Eclipse window</>,
            performance: activeTimePerf,
          },
          {
            value: `${(durationMs / 1000).toFixed(1)}s`,
            label: 'Duration',
            tooltip: <>Actual duration of this Eclipse buff</>,
          },
        ],
        timestamp: this.owner.formatTimestamp(event.timestamp),
        additionalContent: {
          title: 'Cast Sequence',
          content: <SpellSequence casts={castSequence} iconSize={40} />,
        },
      };
    });
  }

  private buildCdPerCastData(): PerCastData[] {
    const durationMs = cdDuration(this.selectedCombatant);
    return this.cdCastEvents.map((event) => {
      const windowEnd = Math.min(event.timestamp + durationMs, this.owner.fight.end_time);
      const activeTime = this.deps.alwaysBeCasting.getActiveTimePercentageInWindow(
        // Add 200ms to remove the cast of Incarn/CA itself
        event.timestamp + 200,
        windowEnd,
      );
      const activeTimePerf = evaluateQualitativePerformanceByThreshold({
        actual: activeTime,
        isGreaterThanOrEqual: { perfect: 0.95, good: 0.9, ok: 0.8 },
      });
      return {
        performance: activeTimePerf,
        stats: [
          {
            value: `${formatPercentage(activeTime, 0)}%`,
            label: 'Active Time',
            tooltip: (
              <>Percentage of time spent actively casting during this {this.cdShortName} window</>
            ),
            performance: activeTimePerf,
          },
        ],
        timestamp: this.owner.formatTimestamp(event.timestamp),
      };
    });
  }
}
