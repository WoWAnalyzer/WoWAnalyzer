import React from 'react';
import SPELLS from 'common/SPELLS/index';
import { formatNumber } from 'common/format';
import { calculatePrimaryStat } from 'common/stats';
import SpellLink from 'common/SpellLink';
import PrimaryStatIcon from 'interface/icons/PrimaryStat';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import ItemManaGained from 'interface/others/ItemManaGained';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import StatTracker from 'parser/shared/modules/StatTracker';

const OVERCHARGE_MANA_HEALING_INCREASE_PER_STACK = 0.04;
let MANA_REGEN_PER_SECOND = 800;

class TheEverRisingTide extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
    buffs: Buffs,
  };
  healing = 0;
  buffActive = false;
  stacks = 0;
  manaGained = 0;
  stat = 0;

  constructor(...args) {
    super(...args);
    this.hasMajor = this.selectedCombatant.hasEssence(SPELLS.EVER_RISING_TIDE_MAJOR.id);
    this.active = this.hasMajor | this.selectedCombatant.hasEssence(SPELLS.EVER_RISING_TIDE_MINOR.id);
    if (!this.active) {
      return;
    }
    this.stat = calculatePrimaryStat(420, 1569, this.selectedCombatant.neck.itemLevel);
    if (this.selectedCombatant.essenceRank(SPELLS.EVER_RISING_TIDE_MINOR.id) < 2) {
      this.stat /= 0.8; // rank 2 grants 20% more stats
    }
    this.abilities.add({
      spell: SPELLS.EVER_RISING_TIDE_CHARGING_BUFF,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      cooldown: 30,
    });
    this.buffs.add({
      spellId: SPELLS.EVER_RISING_TIDE_HEALING_BUFF.id,
      triggeredBySpellId: SPELLS.EVER_RISING_TIDE_CHARGING_BUFF.id,
      timelineHightlight: true,
    });

    this.statTracker.add(SPELLS.EVER_RISING_TIDE_STAT_BUFF.id, {
      intellect: this.stat,
    });
    if(this.selectedCombatant.hasTalent(SPELLS.ENLIGHTENMENT_TALENT.id)){
      MANA_REGEN_PER_SECOND *= 1.1;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this._onHeal);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EVER_RISING_TIDE_HEALING_BUFF), this._applyBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.EVER_RISING_TIDE_HEALING_BUFF), this._removebuff);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.EVER_RISING_TIDE_HEALING_BUFF), this._applyBuff);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.EVER_RISING_TIDE_ENERGIZE), this._energize);
  }

  _onHeal(event) {
    if (!this.buffActive) {
      return;
    }
    this.healing += calculateEffectiveHealing(event, OVERCHARGE_MANA_HEALING_INCREASE_PER_STACK * this.stacks);
  }

  _applyBuff(event) {
    this.buffActive = true;
    this.stacks = event.stack || 1;
  }

  _removebuff(event) {
    this.buffActive = false;
  }

  _energize(event) {
    this.manaGained += event.resourceChange;
  }

  get manaLost() {
    return this.selectedCombatant.getBuffUptime(SPELLS.EVER_RISING_TIDE_CHARGING_BUFF.id) / 1000 * MANA_REGEN_PER_SECOND;
  }

  get minorBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.EVER_RISING_TIDE_STAT_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <AzeritePowerStatistic size="flexible">
        {this.hasMajor && (
          <div className="pad">
            <label><SpellLink id={SPELLS.EVER_RISING_TIDE_MAJOR.id} /> - Major Rank {this.selectedCombatant.essenceRank(SPELLS.EVER_RISING_TIDE_MAJOR.id)}</label>
            <div className="value">
              <ItemHealingDone amount={this.healing} /><br />
              <ItemManaGained amount={this.manaLost * -1} />
            </div>
          </div>
        )}
        <div className="pad">
          <label><SpellLink id={SPELLS.EVER_RISING_TIDE_MINOR.id} /> - Minor Rank {this.selectedCombatant.essenceRank(SPELLS.EVER_RISING_TIDE_MINOR.id)}</label>
          <div className="value">
            <PrimaryStatIcon stat={this.selectedCombatant.spec.primaryStat} /> {formatNumber(this.minorBuffUptime * this.stat)} <small>average {this.selectedCombatant.spec.primaryStat} gained</small><br />
            <ItemManaGained amount={this.manaGained} />
          </div>
        </div>
      </AzeritePowerStatistic>
    );
  }
}

export default TheEverRisingTide;
