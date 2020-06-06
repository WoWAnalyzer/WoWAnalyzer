import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS/index';
import EventEmitter from 'parser/core/modules/EventEmitter';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events, { ApplyBuffEvent, EnergizeEvent, RemoveBuffEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import SpellLink from 'common/SpellLink';
import StatisticGroup from 'interface/statistics/StatisticGroup';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import { formatNumber } from 'common/format';

class MemoryOfLucidDreams extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
    statTracker: StatTracker,
  };
  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;
  protected statTracker!: StatTracker;

  hasLucidMajor?: boolean;
  lastTimestamp = 0;
  minorReductions = 0;
  minorProcs = 0;
  majorReductions = 0;
  majorCasts = 0;
  rank = 0;
  lucidDuration = 12000;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasEssence(SPELLS.LUCID_DREAMS.traitId);
    if (!this.active) {
      return;
    }
    this.hasLucidMajor = this.selectedCombatant.hasMajor(SPELLS.LUCID_DREAMS.traitId);
    this.rank = this.selectedCombatant.essenceRank(SPELLS.LUCID_DREAMS.traitId);
    if (this.rank >= 2) {
      this.lucidDuration += 3000;
    }
    if (this.hasLucidMajor) {
      options.abilities.add({
        spell: SPELLS.LUCID_DREAMS_MAJOR,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      });
    }
    this.addEventListener(EventEmitter.catchAll, this.onEvent);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.LUCID_DREAMS_MAJOR), this.onLucidApplied);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.LUCID_DREAMS_MAJOR), this.onLucidRemoved);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.LUCID_DREAMS_MINOR_RESOURCE_REFUND_FOCUS), this.onLucidEnergize);
  }

  onEvent(event: any) {
    if (!this.selectedCombatant.hasBuff(SPELLS.LUCID_DREAMS_MAJOR.id) || event.timestamp <= this.lastTimestamp || this.lastTimestamp === 0 || !this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND_CAST_SV.id)) {
      return;
    }
    this.reduceKillCommandCooldown(event);
    this.lastTimestamp = event.timestamp;
  }

  onLucidApplied(event: ApplyBuffEvent) {
    this.lastTimestamp = event.timestamp;
    this.majorCasts += 1;
  }

  onLucidRemoved(event: RemoveBuffEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND_CAST_SV.id)) {
      this.reduceKillCommandCooldown(event);
    }
    this.lastTimestamp = 0;
  }

  reduceKillCommandCooldown(event: any) {
    const reductionMs = event.timestamp - this.lastTimestamp;
    this.spellUsable.reduceCooldown(SPELLS.KILL_COMMAND_CAST_SV.id, reductionMs, event.timestamp);
    this.majorReductions += reductionMs;
  }

  onLucidEnergize(event: EnergizeEvent) {
    const rechargeTime = 6 / (1 + this.statTracker.currentHastePercentage) * 1000;
    const refund = rechargeTime / 2;
    if (this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND_CAST_SV.id)) {
      this.spellUsable.reduceCooldown(SPELLS.KILL_COMMAND_CAST_SV.id, refund, event.timestamp);
      this.minorReductions += refund;
      this.minorProcs += 1;
    }
  }

  statistic() {
    return (
      <StatisticGroup category={STATISTIC_CATEGORY.ITEMS} large={false} wide={false} style>
        <ItemStatistic ultrawide>
          <div className="pad">
            <label><SpellLink id={SPELLS.LUCID_DREAMS_MINOR_RESOURCE_REFUND_FOCUS.id} /> - Minor Rank {this.rank}</label>
            <div className="value">
              {this.minorProcs} <small>procs</small> <br />
              {formatNumber(this.minorReductions / 1000)}s <small><SpellLink id={SPELLS.KILL_COMMAND_CAST_SV.id} /> cooldown refunded</small>
            </div>
          </div>
        </ItemStatistic>
        {this.hasLucidMajor && (
          <ItemStatistic ultrawide>
            <div className="pad">
              <label><SpellLink id={SPELLS.LUCID_DREAMS_MAJOR.id} /> - Major Rank {this.rank}</label>
              <div className="value">
                {(this.majorReductions / 1000).toFixed(1)}/{this.lucidDuration * this.majorCasts / 1000}s <small> effective reduction</small>
              </div>
            </div>
          </ItemStatistic>
        )}
      </StatisticGroup>
    );
  }

}

export default MemoryOfLucidDreams;
