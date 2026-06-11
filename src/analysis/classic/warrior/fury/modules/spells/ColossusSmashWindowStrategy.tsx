import type { JSX } from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from '../../spell-list_Warrior_Fury.classic';
import { SpellIcon } from 'interface';
import Analyzer, { type Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

const CS_WINDOW_DURATION = 6500; // milliseconds
const STORM_BOLT_CD = 30000; // milliseconds

interface SpellStats {
  castsInWindow: number;
  theoreticalOpportunities: number;
}

/**
 * Tracks Colossus Smash window optimization. Measures whether burst spells
 * were used when they were available during the armor-bypass window.
 *
 * For cooldown-based spells (Storm Bolt): tracks when they came off cooldown
 * relative to CS windows and whether they were cast.
 *
 * For Raging Blow: it can only be cast while the "Raging Blow!" proc is up
 * (granted by Enrage, max 2 stacks), so a flat "% of casts in window" would be
 * misleading. Instead we count a CS window as an opportunity only when the proc
 * was available during it, and check whether Raging Blow was cast to spend it —
 * mirroring the wowsims Fury APL, which dumps the proc inside the window.
 *
 * For the remaining rage spenders (Execute, Heroic Strike): tracks what % of
 * casts occurred during windows.
 *
 * Note: Colossus Smash only amplifies physical damage, so magic-damage
 * abilities (e.g. Dragon Roar) gain nothing from the window and are excluded.
 */
class ColossusSmashWindowStrategy extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  private csWindowStarts: number[] = [];
  private stormBoltCasts: number[] = [];
  private ragingBlowCasts: number[] = [];
  // Intervals during which the "Raging Blow!" proc was up (stacks >= 1).
  private procIntervals: { start: number; end: number }[] = [];
  private currentProcStart: number | null = null;
  private executeStats = { inWindow: 0, total: 0 };
  private heroicStrikeStats = { inWindow: 0, total: 0 };

  constructor(options: Options) {
    super(options);

    // Track CS windows and spell casts
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COLOSSUS_SMASH),
      this.onColossusSmashCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STORM_BOLT_TALENT),
      this.onStormBoltCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAGING_BLOW),
      this.onRagingBlowCast,
    );

    // Track when the Raging Blow! proc is available so we know which CS windows
    // actually offered a chance to spend it.
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RAGING_BLOW_BUFF),
      this.onRagingBlowProcApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RAGING_BLOW_BUFF),
      this.onRagingBlowProcRemove,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXECUTE),
      this.onExecuteCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HEROIC_STRIKE),
      this.onHeroicStrikeCast,
    );
  }

  private onColossusSmashCast(event: CastEvent) {
    this.csWindowStarts.push(event.timestamp);
  }

  private isInWindow(eventTimestamp: number): boolean {
    return this.csWindowStarts.some(
      (csTime) => eventTimestamp >= csTime && eventTimestamp < csTime + CS_WINDOW_DURATION,
    );
  }

  private onStormBoltCast(event: CastEvent) {
    this.stormBoltCasts.push(event.timestamp);
  }

  private trackWindowStat(stats: { inWindow: number; total: number }, timestamp: number) {
    stats.total++;
    if (this.isInWindow(timestamp)) {
      stats.inWindow++;
    }
  }

  private onRagingBlowCast(event: CastEvent) {
    this.ragingBlowCasts.push(event.timestamp);
  }

  private onRagingBlowProcApply(event: ApplyBuffEvent) {
    if (this.currentProcStart === null) {
      this.currentProcStart = event.timestamp;
    }
  }

  private onRagingBlowProcRemove(event: RemoveBuffEvent) {
    if (this.currentProcStart !== null) {
      this.procIntervals.push({ start: this.currentProcStart, end: event.timestamp });
      this.currentProcStart = null;
    }
  }

  private onExecuteCast(event: CastEvent) {
    this.trackWindowStat(this.executeStats, event.timestamp);
  }

  private onHeroicStrikeCast(event: CastEvent) {
    this.trackWindowStat(this.heroicStrikeStats, event.timestamp);
  }

  private calculateCooldownOpportunities(casts: number[], cooldownDuration: number): SpellStats {
    const fightStart = this.owner.fight.start_time;
    // Reconstruct the spell's actual cooldown timeline from its casts. The spell
    // is assumed available at pull and goes on cooldown for `cooldownDuration`
    // after each cast. A CS window counts as an opportunity only if the spell was
    // off cooldown at some point during that window — so a 30s-cooldown spell can
    // not be "available" for every ~20s CS window.
    const sortedCasts = [...casts].sort((a, b) => a - b);

    let theoreticalOpportunities = 0;

    for (const csWindowStart of this.csWindowStarts) {
      const csWindowEnd = csWindowStart + CS_WINDOW_DURATION;

      // Cooldown state entering the window is set by the last cast before it started.
      const lastCastBeforeWindow = sortedCasts.filter((castTime) => castTime < csWindowStart).pop();
      const availableFrom =
        lastCastBeforeWindow === undefined ? fightStart : lastCastBeforeWindow + cooldownDuration;

      // Off cooldown for at least part of the window => the player could have cast it here.
      if (availableFrom < csWindowEnd) {
        theoreticalOpportunities++;
      }
    }

    const castsInWindow = casts.filter((castTime) => this.isInWindow(castTime)).length;

    return { castsInWindow, theoreticalOpportunities };
  }

  private getStormBoltStats(): SpellStats {
    if (this.stormBoltCasts.length === 0) {
      return { castsInWindow: 0, theoreticalOpportunities: 0 };
    }

    return this.calculateCooldownOpportunities(this.stormBoltCasts, STORM_BOLT_CD);
  }

  private getRagingBlowStats(): SpellStats {
    // Close out a proc that was still up when the fight ended.
    const intervals = [...this.procIntervals];
    if (this.currentProcStart !== null) {
      intervals.push({ start: this.currentProcStart, end: this.owner.fight.end_time });
    }

    if (this.ragingBlowCasts.length === 0 && intervals.length === 0) {
      return { castsInWindow: 0, theoreticalOpportunities: 0 };
    }

    // Raging Blow has no cooldown, so several casts can land in one window. We
    // therefore measure this per-window rather than per-cast: a CS window is an
    // opportunity if the Raging Blow! proc was up during it, and it's "taken" if
    // at least one Raging Blow was cast inside it. This keeps the ratio in 0-100%.
    let theoreticalOpportunities = 0;
    let castsInWindow = 0;
    for (const csWindowStart of this.csWindowStarts) {
      const csWindowEnd = csWindowStart + CS_WINDOW_DURATION;
      const procAvailable = intervals.some(
        (interval) => interval.start < csWindowEnd && interval.end >= csWindowStart,
      );
      if (!procAvailable) {
        continue;
      }
      theoreticalOpportunities++;
      const spentInWindow = this.ragingBlowCasts.some(
        (castTime) => castTime >= csWindowStart && castTime < csWindowEnd,
      );
      if (spentInWindow) {
        castsInWindow++;
      }
    }

    return { castsInWindow, theoreticalOpportunities };
  }

  private renderCooldownSpellStat(spellId: number, stats: SpellStats): JSX.Element | null {
    if (stats.theoreticalOpportunities === 0) {
      return null;
    }

    const efficiency = stats.castsInWindow / stats.theoreticalOpportunities;

    return (
      <div
        key={spellId}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
      >
        <SpellIcon spell={spellId} />
        <span style={{ fontWeight: 'bold', minWidth: 50 }}>{formatPercentage(efficiency, 0)}%</span>
        <span style={{ fontSize: '0.85em', color: '#888' }}>
          ({stats.castsInWindow}/{stats.theoreticalOpportunities} opportunities)
        </span>
      </div>
    );
  }

  private renderRegularSpellStat(
    spellId: number,
    stats: { inWindow: number; total: number },
  ): JSX.Element | null {
    if (stats.total === 0) {
      return null;
    }

    const efficiency = stats.inWindow / stats.total;

    return (
      <div
        key={spellId}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
      >
        <SpellIcon spell={spellId} />
        <span style={{ fontWeight: 'bold', minWidth: 50 }}>{formatPercentage(efficiency, 0)}%</span>
        <span style={{ fontSize: '0.85em', color: '#888' }}>
          ({stats.inWindow}/{stats.total} casts)
        </span>
      </div>
    );
  }

  statistic(): JSX.Element | null {
    const hasData =
      this.csWindowStarts.length > 0 &&
      (this.stormBoltCasts.length > 0 ||
        this.ragingBlowCasts.length > 0 ||
        this.executeStats.total > 0 ||
        this.heroicStrikeStats.total > 0);

    if (!hasData) {
      return null;
    }

    const stormBoltStats = this.getStormBoltStats();
    const ragingBlowStats = this.getRagingBlowStats();

    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(11)}>
        <div style={{ padding: '12px 15px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
              fontWeight: 'bold',
            }}
          >
            <SpellIcon spell={SPELLS.COLOSSUS_SMASH.id} />
            Colossus Smash Window Optimization
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div
              style={{ fontSize: '0.85em', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}
            >
              Cooldown / proc-based (% of opportunities):
            </div>
            {this.renderCooldownSpellStat(SPELLS.STORM_BOLT_TALENT.id, stormBoltStats)}
            {this.renderCooldownSpellStat(SPELLS.RAGING_BLOW.id, ragingBlowStats)}
          </div>

          <div>
            <div
              style={{ fontSize: '0.85em', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}
            >
              Rage-based (% of casts in window):
            </div>
            {this.renderRegularSpellStat(SPELLS.EXECUTE.id, this.executeStats)}
            {this.renderRegularSpellStat(SPELLS.HEROIC_STRIKE.id, this.heroicStrikeStats)}
          </div>
        </div>
      </StatisticBar>
    );
  }
}

export default ColossusSmashWindowStrategy;
