import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatNumber, formatPercentage } from 'common/format';
import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import SPELLS from 'common/SPELLS';
import RACES from 'game/RACES';
import HIT_TYPES from 'game/HIT_TYPES';
import { calculateAzeriteEffects } from 'common/stats';
import { BEAST_MASTERY_DAMAGE_AURA } from 'parser/hunter/beastmastery/constants';

/**
 * Your primary pet's Basic Attack deals more damage for each other pet you have active.
 * Basic Attacks are Claw, Smack and Bite.
 *
 * Basic Attack formula:
 * [(1 * 2 * 1 * 1 * (Ranged attack power * 0.333) * (1 + Versatility))]
 * Deals 100% more damage and costs 100% more Focus when your pet has 50 or more Focus.
 *
 * Example report: https://www.warcraftlogs.com/reports/m9KrNBVCtDALZpzT#source=5&type=summary&fight=1
 */

const BASIC_ATTACKS = [
  SPELLS.CLAW.id,
  SPELLS.BITE.id,
  SPELLS.SMACK.id,
];

const PACK_ALPHA_DAMAGE_COEFFICIENT = 0.636;
const debug = true;
const BESTIAL_WRATH_DAMAGE_BONUS = 0.25;
const ASPECT_OF_THE_BEAST_MODIFIER = 0.3;

//TODO: Accurately calculate total damage contribution - see: 
class PackAlpha extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  traitBonus = 0;
  traitDamageContribution = 0;
  lastAttackPower = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PACK_ALPHA.id);

    if (!this.active) {
      return;
    }

    this.traitBonus = this.selectedCombatant.traitsBySpellId[SPELLS.PACK_ALPHA.id]
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.PACK_ALPHA.id, rank)[0], 0);
    debug && console.log(`Pack Alpha bonus from items: ${this.traitBonus}`);
  }

  get packAlphaDamageContribution() {
    return this.traitDamageContribution;
  }

  on_byPlayer_cast(event) {
    if (event.attackPower !== undefined && event.attackPower > 0) {
      this.lastAttackPower = event.attackPower;
    }
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (!BASIC_ATTACKS.includes(spellId)) {
      return;
    }

    const damageDone = event.amount + event.absorbed;
    const modifier = damageDone / (this.lastAttackPower * PACK_ALPHA_DAMAGE_COEFFICIENT + this.traitBonus);
    const traitDamageContribution = this.traitBonus * modifier;
    this.traitDamageContribution += traitDamageContribution;

    if (debug) {
      const critMultiplier = this.selectedCombatant.race === RACES.tauren ? 2.04 : 2.00;
      const externalModifier = (event.amount / event.unmitigatedAmount) / (event.hitType === HIT_TYPES.CRIT ? critMultiplier : 1.0);
      let estimatedDamage = this.traitBonus * (1 + this.statTracker.currentVersatilityPercentage) * (1 + this.statTracker.currentMasteryPercentage) * BEAST_MASTERY_DAMAGE_AURA;
      if (!this.selectedCombatant.hasBuff(SPELLS.BESTIAL_WRATH.id)) {
        estimatedDamage *= 1 / (1 + BESTIAL_WRATH_DAMAGE_BONUS);
      }
      if (this.selectedCombatant.hasTalent(SPELLS.ASPECT_OF_THE_BEAST_TALENT.id)) {
        estimatedDamage *= 1 + ASPECT_OF_THE_BEAST_MODIFIER;
      }
      if (event.hitType === HIT_TYPES.CRIT) {
        estimatedDamage *= critMultiplier;
      }
      estimatedDamage *= externalModifier;
      console.log(`Damage: ${damageDone}, externalModifier: ${externalModifier.toFixed(3)}, estimatedDamage: ${estimatedDamage.toFixed(0)}, traitDamageContribution: ${traitDamageContribution.toFixed(0)} bw up?: ${this.selectedCombatant.hasBuff(SPELLS.BESTIAL_WRATH.id)}`);

      const variation = estimatedDamage / traitDamageContribution;
      console.log(`Matching of contribution calculations: ${(variation * 100).toFixed(1)}%`);
    }
  }

  statistic() {
    const damageThroughputPercent = this.owner.getPercentageOfTotalDamageDone(this.traitDamageContribution);
    const dps = this.traitDamageContribution / this.owner.fightDuration * 1000;

    return (
      <TraitStatisticBox
        trait={SPELLS.PACK_ALPHA.id}
        value={(
          <>
            {formatPercentage(damageThroughputPercent)} % / {formatNumber(dps)} DPS
          </>
        )}
        tooltip={`Damage done: ${formatNumber(this.traitDamageContribution)}`}
      />
    );
  }
}

export default PackAlpha;
