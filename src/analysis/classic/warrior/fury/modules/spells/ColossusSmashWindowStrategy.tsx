import type { JSX } from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from '../../spell-list_Warrior_Fury.classic';
import { SpellIcon } from 'interface';
import Analyzer, { type Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';

interface SpellWindowStats {
  inWindow: number;
  outWindow: number;
}

/**
 * Tracks whether critical burst spells are being cast during the Colossus Smash
 * window. CS applies a ~6.5s armor-bypass debuff on a ~20s cooldown, making it
 * ideal for stacking burst damage (Storm Bolt, Dragon Roar, Execute, Raging Blow).
 *
 * This analyzer monitors cast efficiency within the window to inform rotation optimization.
 */
class ColossusSmashWindowStrategy extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  private stormBoltStats: SpellWindowStats = { inWindow: 0, outWindow: 0 };
  private dragonRoarStats: SpellWindowStats = { inWindow: 0, outWindow: 0 };
  private executeStats: SpellWindowStats = { inWindow: 0, outWindow: 0 };
  private ragingBlowStats: SpellWindowStats = { inWindow: 0, outWindow: 0 };
  private heroicStrikeStats: SpellWindowStats = { inWindow: 0, outWindow: 0 };

  constructor(options: Options) {
    super(options);

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
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HEROIC_STRIKE),
      this.onHeroicStrike,
    );
  }

  private isColossusSmashActive(event: CastEvent): boolean {
    const target = this.enemies.getEntity(event);
    return target ? target.hasBuff(SPELLS.COLOSSUS_SMASH.id) : false;
  }

  private recordCast(stats: SpellWindowStats, event: CastEvent) {
    if (this.isColossusSmashActive(event)) {
      stats.inWindow++;
    } else {
      stats.outWindow++;
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

  private renderSpellStats(
    spellId: number,
    spellName: string,
    stats: SpellWindowStats,
  ): JSX.Element | null {
    if (stats.inWindow + stats.outWindow === 0) {
      return null;
    }

    const total = stats.inWindow + stats.outWindow;
    const percentage = stats.inWindow / total;

    return (
      <div
        key={spellId}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
      >
        <SpellIcon spell={spellId} />
        <span style={{ minWidth: 120 }}>{spellName}</span>
        <span style={{ fontWeight: 'bold', minWidth: 40 }}>{formatPercentage(percentage, 0)}%</span>
        <span style={{ fontSize: '0.85em', color: '#888' }}>
          ({stats.inWindow}/{total})
        </span>
      </div>
    );
  }

  statistic(): JSX.Element | null {
    const hasData =
      this.stormBoltStats.inWindow +
        this.stormBoltStats.outWindow +
        this.dragonRoarStats.inWindow +
        this.dragonRoarStats.outWindow +
        this.executeStats.inWindow +
        this.executeStats.outWindow +
        this.ragingBlowStats.inWindow +
        this.ragingBlowStats.outWindow +
        this.heroicStrikeStats.inWindow +
        this.heroicStrikeStats.outWindow >
      0;

    if (!hasData) {
      return null;
    }

    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(11)}>
        <div style={{ padding: '12px 0' }}>
          <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
            Colossus Smash Window Usage
          </div>
          {this.renderSpellStats(
            SPELLS.STORM_BOLT_TALENT.id,
            SPELLS.STORM_BOLT_TALENT.name,
            this.stormBoltStats,
          )}
          {this.renderSpellStats(
            SPELLS.DRAGON_ROAR_TALENT.id,
            SPELLS.DRAGON_ROAR_TALENT.name,
            this.dragonRoarStats,
          )}
          {this.renderSpellStats(SPELLS.EXECUTE.id, SPELLS.EXECUTE.name, this.executeStats)}
          {this.renderSpellStats(
            SPELLS.RAGING_BLOW.id,
            SPELLS.RAGING_BLOW.name,
            this.ragingBlowStats,
          )}
          {this.renderSpellStats(
            SPELLS.HEROIC_STRIKE.id,
            SPELLS.HEROIC_STRIKE.name,
            this.heroicStrikeStats,
          )}
        </div>
      </StatisticBar>
    );
  }
}

export default ColossusSmashWindowStrategy;
