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
const GCD_DURATION = 1500; // milliseconds
const MAX_GCD_CASTS_PER_WINDOW = Math.floor(CS_WINDOW_DURATION / GCD_DURATION); // ~4

interface AbilityStat {
  inWindow: number;
  total: number;
}

/**
 * Tracks Colossus Smash window optimization. CS applies a ~6.5s armor-bypass
 * debuff on a ~20s cooldown. This analyzer measures:
 * - GCD ability usage (Storm Bolt, Raging Blow, Execute, Dragon Roar) - limited to ~4 per window
 * - Off-GCD ability usage (Heroic Strike) - unlimited, rage-dependent
 *
 * This reveals whether the player is efficiently using the burst window.
 */
class ColossusSmashWindowStrategy extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  private csWindowStarts: number[] = [];
  private stormBoltStats: AbilityStat = { inWindow: 0, total: 0 };
  private dragonRoarStats: AbilityStat = { inWindow: 0, total: 0 };
  private ragingBlowStats: AbilityStat = { inWindow: 0, total: 0 };
  private executeStats: AbilityStat = { inWindow: 0, total: 0 };
  private heroicStrikeStats: AbilityStat = { inWindow: 0, total: 0 };

  constructor(options: Options) {
    super(options);

    // Track when CS windows start
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COLOSSUS_SMASH),
      this.onColossusSmashCast,
    );

    // Track GCD abilities
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STORM_BOLT_TALENT),
      this.onStormBolt,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DRAGON_ROAR_TALENT),
      this.onDragonRoar,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXECUTE), this.onExecute);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAGING_BLOW),
      this.onRagingBlow,
    );

    // Track off-GCD abilities
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HEROIC_STRIKE),
      this.onHeroicStrike,
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

  private recordCast(stat: AbilityStat, event: CastEvent) {
    stat.total++;
    if (this.isInWindow(event.timestamp)) {
      stat.inWindow++;
    }
  }

  private onStormBolt(event: CastEvent) {
    this.recordCast(this.stormBoltStats, event);
  }

  private onDragonRoar(event: CastEvent) {
    this.recordCast(this.dragonRoarStats, event);
  }

  private onExecute(event: CastEvent) {
    this.recordCast(this.executeStats, event);
  }

  private onRagingBlow(event: CastEvent) {
    this.recordCast(this.ragingBlowStats, event);
  }

  private onHeroicStrike(event: CastEvent) {
    this.recordCast(this.heroicStrikeStats, event);
  }

  private renderAbilityStat(spellId: number, stat: AbilityStat): JSX.Element | null {
    if (stat.total === 0) {
      return null;
    }

    const percentage = stat.inWindow / stat.total;

    return (
      <div
        key={spellId}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
      >
        <SpellIcon spell={spellId} />
        <span style={{ fontWeight: 'bold', minWidth: 50 }}>{formatPercentage(percentage, 0)}%</span>
        <span style={{ fontSize: '0.85em', color: '#888' }}>
          ({stat.inWindow}/{stat.total})
        </span>
      </div>
    );
  }

  statistic(): JSX.Element | null {
    const totalWindows = this.csWindowStarts.length;
    if (totalWindows === 0) {
      return null;
    }

    const totalGcdCasts =
      this.stormBoltStats.inWindow +
      this.dragonRoarStats.inWindow +
      this.executeStats.inWindow +
      this.ragingBlowStats.inWindow;
    const theoreticalMaxGcdCasts = totalWindows * MAX_GCD_CASTS_PER_WINDOW;
    const gcdEfficiency = totalGcdCasts / theoreticalMaxGcdCasts;

    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(11)}>
        <div style={{ padding: '12px 15px' }}>
          <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
            Colossus Smash Window Optimization
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ minWidth: 140, fontWeight: 'bold' }}>GCD Efficiency</span>
              <span style={{ fontWeight: 'bold', minWidth: 50 }}>
                {formatPercentage(gcdEfficiency, 0)}%
              </span>
              <span style={{ fontSize: '0.85em', color: '#888' }}>
                ({totalGcdCasts}/{theoreticalMaxGcdCasts} casts)
              </span>
            </div>
            <div
              style={{ fontSize: '0.85em', color: '#888', paddingLeft: '8px', marginBottom: '8px' }}
            >
              ~{MAX_GCD_CASTS_PER_WINDOW} per window × {totalWindows} windows
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div
              style={{ fontSize: '0.85em', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}
            >
              Per Ability (% in window):
            </div>
            {this.renderAbilityStat(SPELLS.STORM_BOLT_TALENT.id, this.stormBoltStats)}
            {this.renderAbilityStat(SPELLS.DRAGON_ROAR_TALENT.id, this.dragonRoarStats)}
            {this.renderAbilityStat(SPELLS.RAGING_BLOW.id, this.ragingBlowStats)}
            {this.renderAbilityStat(SPELLS.EXECUTE.id, this.executeStats)}
            {this.renderAbilityStat(SPELLS.HEROIC_STRIKE.id, this.heroicStrikeStats)}
          </div>
        </div>
      </StatisticBar>
    );
  }
}

export default ColossusSmashWindowStrategy;
