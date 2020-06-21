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
import { calculatePrimaryStat } from 'common/stats';
import VersatilityIcon from 'interface/icons/Versatility';
import LeechIcon from 'interface/icons/Leech';

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
  minorReductionMs = 0;
  wastedMinorReductionMs = 0;
  minorProcs = 0;
  minorFocusGain = 0;
  minorFocusWaste = 0;
  majorReductions = 0;
  majorCasts = 0;
  rank = 0;
  lucidDuration = 12000;
  versGain = 0;
  leechGain = 0;

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

    if (this.rank > 2) {
      this.versGain = calculatePrimaryStat(517, 466, this.selectedCombatant.neck.itemLevel);
      this.leechGain = calculatePrimaryStat(517, 1540, this.selectedCombatant.neck.itemLevel);
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
          recommendedEfficiency: 0.9,
        },
      });
    }

    options.statTracker.add(SPELLS.LUCID_DREAMS_MINOR_STAT_BUFF.id, {
      versatility: this.versGain,
    });
    options.statTracker.add(SPELLS.LUCID_DREAMS_MAJOR.id, {
      leech: this.leechGain,
    });

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
      const effectiveReduction = this.spellUsable.reduceCooldown(SPELLS.KILL_COMMAND_CAST_SV.id, refund, event.timestamp);
      this.minorReductionMs += effectiveReduction;
      this.wastedMinorReductionMs += refund - effectiveReduction;
    }
    this.minorFocusGain += event.resourceChange - event.waste;
    this.minorFocusWaste += event.waste;
    this.minorProcs += 1;
  }

  get minorBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.LUCID_DREAMS_MINOR_STAT_BUFF.id) / this.owner.fightDuration;
  }

  get majorBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.LUCID_DREAMS_MAJOR.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <StatisticGroup
        category={STATISTIC_CATEGORY.ITEMS}
        large={false} wide={false} style
      >
        <ItemStatistic
          size="flexible"
          ultrawide
          tooltip={(
            <>
              {this.minorProcs} <small>procs of Lucid Minor</small>
            </>
          )}
        >
          <div className="pad">
            <label><SpellLink id={SPELLS.LUCID_DREAMS_MINOR_RESOURCE_REFUND_FOCUS.id} /> - Minor Rank {this.rank}</label>
            <div className="value">
              {(this.minorReductionMs / 1000).toFixed(1)}/{((this.minorReductionMs + this.wastedMinorReductionMs) / 1000).toFixed(1)}s <small> <SpellLink id={SPELLS.KILL_COMMAND_CAST_SV.id} /> CDR </small> <br />
              {this.minorFocusGain}/{this.minorFocusGain + this.minorFocusWaste} <small> focus gained </small><br />
              {this.rank > 2 &&
              <>
                <VersatilityIcon /> {formatNumber(this.minorBuffUptime * this.versGain)} <small>average versatility gained</small>
              </>}
            </div>
          </div>
        </ItemStatistic>
        {this.hasLucidMajor && (
          <ItemStatistic
            size="flexible"
            ultrawide
          >
            <div className="pad">
              <label><SpellLink id={SPELLS.LUCID_DREAMS_MAJOR.id} /> - Major Rank {this.rank}</label>
              <div className="value">
                {(this.majorReductions / 1000).toFixed(1)}/{this.lucidDuration * this.majorCasts / 1000}s <small> effective CDR </small><br />
                {this.rank > 2 && <>
                  <LeechIcon /> {formatNumber(this.majorBuffUptime * this.leechGain)} <small>average leech gained</small>
                </>}
              </div>
            </div>
          </ItemStatistic>
        )}
      </StatisticGroup>
    );
  }

}

export default MemoryOfLucidDreams;
