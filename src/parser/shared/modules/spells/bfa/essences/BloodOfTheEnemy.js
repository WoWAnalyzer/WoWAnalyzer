import React from 'react';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import StatisticGroup from 'interface/statistics/StatisticGroup';
import HasteIcon from 'interface/icons/Haste';
import CritIcon from 'interface/icons/CriticalStrike';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Abilities from 'parser/core/modules/Abilities';

import EnemyInstances from 'parser/shared/modules/EnemyInstances';
import StatTracker from 'parser/shared/modules/StatTracker';
import ItemDamageDone from 'interface/ItemDamageDone';
import { calculatePrimaryStat } from 'common/stats';

const BOTE_DAMAGE_BONUS = 0.25;

const MINOR_SPELL_IDS = {
  1: SPELLS.BLOOD_OF_THE_ENEMY_MINOR.id,
  2: SPELLS.BLOOD_OF_THE_ENEMY_MINOR_RANK_TWO_CRIT_BUFF.id,
  3: SPELLS.BLOOD_OF_THE_ENEMY_MINOR_RANK_THREE_PARTIAL_STACK_LOSS.id,
  4: SPELLS.BLOOD_OF_THE_ENEMY_MINOR_RANK_THREE_PARTIAL_STACK_LOSS.id,
};

const MAJOR_SPELL_IDS = {
  1: SPELLS.BLOOD_OF_THE_ENEMY.id,
  2: SPELLS.BLOOD_OF_THE_ENEMY_MAJOR_RANK_TWO_REDUCED_CD.id,
  3: SPELLS.BLOOD_OF_THE_ENEMY_MAJOR_RANK_THREE_CRIT_DAMAGE_BUFF.id,
  4: SPELLS.BLOOD_OF_THE_ENEMY_MAJOR_RANK_THREE_CRIT_DAMAGE_BUFF.id,
};

/**
 * Major: The Heart of Azeroth erupts violently, dealing 19,408 Shadow damage to enemies within 12 yds. You gain 25% critical strike chance against the targets for 10 sec.
 * Minor: Your critical strikes with spells and abilities grant a stack of Blood-Soaked. Upon reaching 40 stacks, you gain 548 Haste for 8 sec.
 * R2: 30 second CD reduction / Each stack of Blood-Soaked grants 8 Critical Strike
 * R3: increases your critical hit damage by 25% for 5 sec / Blood-Soaked has a 25% chance of only consuming 30 stacks.
 */
class BloodOfTheEnemy extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
    enemies: EnemyInstances,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.BLOOD_OF_THE_ENEMY.traitId);
    if (!this.active) {
      return;
    }

    const rank = this.selectedCombatant.essenceRank(SPELLS.BLOOD_OF_THE_ENEMY.traitId);
    this.haste = calculatePrimaryStat(505, 726, this.selectedCombatant.neck.itemLevel);
    this.statTracker.add(SPELLS.BLOOD_SOAKED_HASTE_BUFF.id, {
      haste: this.haste,
    });

    this.hasMajor = this.selectedCombatant.hasMajor(SPELLS.BLOOD_OF_THE_ENEMY.traitId);
    if (this.hasMajor) {
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

    if (rank > 1) {
      this.crit = calculatePrimaryStat(455, 7, this.selectedCombatant.neck.itemLevel);
      this.statTracker.add(SPELLS.BLOOD_SOAKED_STACKING_BUFF.id, {
        crit: this.crit,
      });

      this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BLOOD_SOAKED_STACKING_BUFF), this.handleStacks);
      this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BLOOD_SOAKED_STACKING_BUFF), this.handleStacks);
      this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.BLOOD_SOAKED_STACKING_BUFF), this.handleStacks);
    }

    if (rank > 2 && this.hasMajor) {
      this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    }
  }

  majorCastDamage = 0;
  currentStacks = 0;
  lastStackTimestamp = 0;
  totalCrit = 0;
  bonusDamage = 0;
  crit = 0;
  haste = 0;

  onMajorCastDamage(event) {
    this.majorCastDamage += event.amount + (event.absorbed || 0);
  }

  onDamage(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }

    const playerHasBuff = this.selectedCombatant.hasBuff(SPELLS.SEETHING_RAGE.id);
    if (!playerHasBuff) {
      return;
    }

    const isCrit = event.hitType === HIT_TYPES.CRIT || event.hitType === HIT_TYPES.BLOCKED_CRIT;
    if (!isCrit) {
      return;
    }

    this.bonusDamage += calculateEffectiveDamage(event, BOTE_DAMAGE_BONUS);
  }

  handleStacks(event) {
    const uptimeOnStack = event.timestamp - this.lastStackTimestamp;
    this.totalCrit += this.currentStacks * this.crit * uptimeOnStack;

    if (event.type === 'applybuff') {
      // when the R3 minor procs and only 30 stacks are consumed, an applybuff granting 10 stacks goes out after the removebuff but has the same timestamp as the removebuff event
      this.currentStacks = (uptimeOnStack === 0 ? 10 : 1);
    } else if (event.type === 'removebuff') {
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
    return (this.haste * this.uptime);
  }

  get averageCrit() {
    return (this.totalCrit / this.owner.fightDuration).toFixed(0);
  }

  statistic() {
    const rank = this.selectedCombatant.essenceRank(SPELLS.BLOOD_OF_THE_ENEMY.traitId);
    const rankThreeTooltip = (rank > 2) ? <><br />Damage done from increased critical hit damage: {formatNumber(this.bonusDamage)}</> : <> </>;
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
          <ItemStatistic
            ultrawide
            tooltip={(
              <>
                Damage done by AoE hit: {formatNumber(this.majorCastDamage)} {rankThreeTooltip}
              </>
            )}
          >
            <div className="pad">
              <label><SpellLink id={MAJOR_SPELL_IDS[rank]} /> - Major Rank {rank}</label>
              <div className="value">
                <ItemDamageDone amount={this.bonusDamage + this.majorCastDamage} />
              </div>
            </div>
          </ItemStatistic>
        )}
      </StatisticGroup>
    );
  }
}

export default BloodOfTheEnemy;
