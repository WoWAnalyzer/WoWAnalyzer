import type { JSX } from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from '../../spell-list_Warrior_Fury.classic';
import { SpellIcon } from 'interface';
import Analyzer, { type Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

const CS_WINDOW_DURATION = 6500; // milliseconds
const STORM_BOLT_CD = 30000; // milliseconds
const DRAGON_ROAR_CD = 60000; // milliseconds

interface SpellStats {
  castsInWindow: number;
  theoreticalOpportunities: number;
}

/**
 * Tracks Colossus Smash window optimization. Measures whether burst spells
 * were used when they were available during the armor-bypass window.
 *
 * For cooldown-based spells (Storm Bolt, Dragon Roar): tracks when they
 * came off cooldown relative to CS windows and whether they were cast.
 *
 * For non-cooldown spells (Raging Blow, Execute, Heroic Strike): tracks
 * what % of casts occurred during windows.
 */
class ColossusSmashWindowStrategy extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  private csWindowStarts: number[] = [];
  private stormBoltCasts: number[] = [];
  private dragonRoarCasts: number[] = [];
  private ragingBlowStats = { inWindow: 0, total: 0 };
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
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DRAGON_ROAR_TALENT),
      this.onDragonRoarCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAGING_BLOW),
      this.onRagingBlowCast,
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

  private onDragonRoarCast(event: CastEvent) {
    this.dragonRoarCasts.push(event.timestamp);
  }

  private onRagingBlowCast(event: CastEvent) {
    this.ragingBlowStats.total++;
    if (this.isInWindow(event.timestamp)) {
      this.ragingBlowStats.inWindow++;
    }
  }

  private onExecuteCast(event: CastEvent) {
    this.executeStats.total++;
    if (this.isInWindow(event.timestamp)) {
      this.executeStats.inWindow++;
    }
  }

  private onHeroicStrikeCast(event: CastEvent) {
    this.heroicStrikeStats.total++;
    if (this.isInWindow(event.timestamp)) {
      this.heroicStrikeStats.inWindow++;
    }
  }

  private calculateCooldownOpportunities(cooldownDuration: number): SpellStats {
    const fightStart = this.owner.fight.start_time;

    // For each CS window, check if the spell is available (off cooldown) at the window start
    let theoreticalOpportunities = 0;

    for (const csWindowStart of this.csWindowStarts) {
      // Check how much cooldown would be remaining at this CS window start
      const timeSinceFightStart = csWindowStart - fightStart;
      const numCooldownResets = Math.floor(timeSinceFightStart / cooldownDuration);
      const lastResetTime = fightStart + numCooldownResets * cooldownDuration;

      // The spell is available at csWindowStart if its last reset was before now
      if (lastResetTime <= csWindowStart) {
        theoreticalOpportunities++;
      }
    }

    return { castsInWindow: 0, theoreticalOpportunities };
  }

  private getStormBoltStats(): SpellStats {
    if (this.stormBoltCasts.length === 0) {
      return { castsInWindow: 0, theoreticalOpportunities: 0 };
    }

    const stats = this.calculateCooldownOpportunities(STORM_BOLT_CD);

    // Count how many casts were in windows
    stats.castsInWindow = this.stormBoltCasts.filter((castTime) =>
      this.isInWindow(castTime),
    ).length;

    return stats;
  }

  private getDragonRoarStats(): SpellStats {
    if (this.dragonRoarCasts.length === 0) {
      return { castsInWindow: 0, theoreticalOpportunities: 0 };
    }

    const stats = this.calculateCooldownOpportunities(DRAGON_ROAR_CD);

    // Count how many casts were in windows
    stats.castsInWindow = this.dragonRoarCasts.filter((castTime) =>
      this.isInWindow(castTime),
    ).length;

    return stats;
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

  private renderNoOpportunities(spellId: number): JSX.Element | null {
    if (this.stormBoltCasts.length === 0 && this.dragonRoarCasts.length === 0) {
      return null;
    }

    return (
      <div
        key={spellId}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
      >
        <SpellIcon spell={spellId} />
        <span style={{ fontSize: '0.85em', color: '#888' }}>Not cast during fight</span>
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
        this.dragonRoarCasts.length > 0 ||
        this.ragingBlowStats.total > 0 ||
        this.executeStats.total > 0 ||
        this.heroicStrikeStats.total > 0);

    if (!hasData) {
      return null;
    }

    const stormBoltStats = this.getStormBoltStats();
    const dragonRoarStats = this.getDragonRoarStats();

    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(11)}>
        <div style={{ padding: '12px 15px' }}>
          <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
            Colossus Smash Window Optimization
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div
              style={{ fontSize: '0.85em', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}
            >
              Cooldown-based (% of opportunities):
            </div>
            {this.renderCooldownSpellStat(SPELLS.STORM_BOLT_TALENT.id, stormBoltStats)}
            {this.renderCooldownSpellStat(SPELLS.DRAGON_ROAR_TALENT.id, dragonRoarStats)}
          </div>

          <div>
            <div
              style={{ fontSize: '0.85em', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}
            >
              Rage-based (% of casts in window):
            </div>
            {this.renderRegularSpellStat(SPELLS.RAGING_BLOW.id, this.ragingBlowStats)}
            {this.renderRegularSpellStat(SPELLS.EXECUTE.id, this.executeStats)}
            {this.renderRegularSpellStat(SPELLS.HEROIC_STRIKE.id, this.heroicStrikeStats)}
          </div>
        </div>
      </StatisticBar>
    );
  }
}

export default ColossusSmashWindowStrategy;
