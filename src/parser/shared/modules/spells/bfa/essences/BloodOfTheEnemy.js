import React from 'react';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import StatisticGroup from 'interface/statistics/StatisticGroup';
import HasteIcon from 'interface/icons/Haste';
import CritIcon from 'interface/icons/CriticalStrike';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import StatTracker from 'parser/shared/modules/StatTracker';
import ItemDamageDone from 'interface/others/ItemDamageDone';

const HASTE_PROC_AMOUNT = 548;
const CRIT_PER_STACK = 8;

const MINOR_SPELL_IDS = {
  1: SPELLS.BLOOD_OF_THE_ENEMY_MINOR.id,
  2: SPELLS.BLOOD_OF_THE_ENEMY_MINOR_RANK_TWO_CRIT_BUFF.id,
  3: SPELLS.BLOOD_OF_THE_ENEMY_MINOR_RANK_THREE_PARTIAL_STACK_LOSS.id,
};

const MAJOR_SPELL_IDS = {
  1: SPELLS.BLOOD_OF_THE_ENEMY.id,
  2: SPELLS.BLOOD_OF_THE_ENEMY_MAJOR_RANK_TWO_REDUCED_CD.id,
  3: SPELLS.BLOOD_OF_THE_ENEMY_MAJOR_RANK_THREE_CRIT_DAMAGE_BUFF.id,
};

/**
 * Major: The Heart of Azeroth erupts violently, dealing 19,408 Shadow damage to enemies within 12 yds. You gain 25% critical strike chance against the targets for 10 sec.
 * Minor: Your critical strikes with spells and abilities grant a stack of Blood-Soaked. Upon reaching 40 stacks, you gain 548 Haste for 8 sec.
 * R2: 30 second CD reduction / Each stack of Blood-Soaked grants 8 Critical Strike
 * R3: increases your critical hit damage by 25% for 15 sec / Blood-Soaked has a 25% chance of only consuming 30 stacks.
 */
class BloodOfTheEnemy extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.BLOOD_OF_THE_ENEMY.traitId);
    if (!this.active) {
      return;
    }

    const rank = this.selectedCombatant.essenceRank(SPELLS.BLOOD_OF_THE_ENEMY.traitId);
    this.statTracker.add(SPELLS.BLOOD_SOAKED_HASTE_BUFF.id, {
      crit: (rank === 1) ? 0 : 8,
      haste: 548,
    });

    this.statTracker.add(SPELLS.BLOOD_SOAKED_STACKING_BUFF.id, {
      crit: (rank === 1) ? 0 : 8,
    });

    
    this.hasMajor = this.selectedCombatant.hasMajor(SPELLS.BLOOD_OF_THE_ENEMY.traitId);
    if(this.hasMajor) {
      this.abilities.add({
        spell: SPELLS.BLOOD_OF_THE_ENEMY,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: (rank === 1) ? 120 : 90,
        gcd: {
        base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.80,
        },
      });
    }
    
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLOOD_OF_THE_ENEMY), this.onMajorCastDamage);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BLOOD_SOAKED_STACKING_BUFF), this.handleStacks);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BLOOD_SOAKED_STACKING_BUFF), this.handleStacks);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.BLOOD_SOAKED_STACKING_BUFF), this.handleStacks);
  }

  majorCastDamage = 0;
  currentStacks = 0;
  lastStackTimestamp = 0;
  totalCrit = 0;

  onMajorCastDamage(event){
    this.majorCastDamage += event.amount + (event.absorbed || 0);
  }

  handleStacks(event) {
    if (this.rank < 2) {
      return;
    }

    const uptimeOnStack = event.timestamp - this.lastStackTimestamp;
    this.totalCrit += this.currentStacks * CRIT_PER_STACK * uptimeOnStack;
    console.log(this.currentStacks * CRIT_PER_STACK * uptimeOnStack);

    if (event.type === "applybuff") {
      // when the R3 minor procs and only 30 stacks are consumed, a 10 stack apply buff goes out after the remove but on the same timestamp
      this.currentStacks = (uptimeOnStack === 0 ? 10 : 1);
    } else if (event.type === "removebuff") {
      this.currentStacks = 0;
    } else {
      this.currentStacks = event.stack;
    }

    this.lastStackTimestamp = event.timestamp;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BLOOD_SOAKED_HASTE_BUFF.id) / this.owner.fightDuration;
  }

  get averageHaste() {
    return (HASTE_PROC_AMOUNT * this.uptime);
  }

  get averageCrit() {
    return (this.totalCrit / this.owner.fightDuration).toFixed(0);
  }

  statistic() {
    const rank = this.selectedCombatant.essenceRank(SPELLS.BLOOD_OF_THE_ENEMY.traitId);
    return (
      <StatisticGroup category={STATISTIC_CATEGORY.ITEMS}>
        <ItemStatistic ultrawide>
          <div className="pad">
            <label><SpellLink id={MINOR_SPELL_IDS[rank]} /> - Minor Rank {rank}</label>
            <div className="value">
              <HasteIcon /> {formatNumber(this.averageHaste)} <small>average Haste gained</small><br />
              <CritIcon /> {formatNumber(this.averageCrit)} <small>average Crit gained</small>
            </div>
          </div>
        </ItemStatistic>
        {this.hasMajor && (
          <ItemStatistic ultrawide>
            <div className="pad">
              <label><SpellLink id={MAJOR_SPELL_IDS[rank]} /> - Major Rank {rank}</label>
              <div className="value">
                <ItemDamageDone amount={this.majorCastDamage} /><br />
              </div>
            </div>
          </ItemStatistic>
        )}
      </StatisticGroup>
    );
  }
}

export default BloodOfTheEnemy;