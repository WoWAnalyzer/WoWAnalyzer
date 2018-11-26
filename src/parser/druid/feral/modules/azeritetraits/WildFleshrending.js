import React from 'react';

import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { calculateAzeriteEffects } from 'common/stats';
import HIT_TYPES from 'game/HIT_TYPES';
import RACES from 'game/RACES';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import StatTracker from 'parser/shared/modules/StatTracker';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';

import { FERAL_DRUID_DAMAGE_AURA, INCARNATION_SHRED_DAMAGE, SAVAGE_ROAR_DAMAGE_BONUS, TIGERS_FURY_DAMAGE_BONUS, BLOODTALONS_DAMAGE_BONUS, MOMENT_OF_CLARITY_DAMAGE_BONUS, SHRED_SWIPE_BONUS_ON_BLEEDING } from '../../constants.js';
import Abilities from '../Abilities.js';

const debug = false;
// Swipe has a bear and a cat version, both are affected by the trait. It can be replaced by the talent Brutal Slash which benefits in the same way.
const SWIPE_SPELLS = [
  SPELLS.SWIPE_BEAR.id,
  SPELLS.SWIPE_CAT.id,
  SPELLS.BRUTAL_SLASH_TALENT.id,
];
const HIT_TYPES_TO_IGNORE = [
  HIT_TYPES.MISS,
  HIT_TYPES.DODGE,
  HIT_TYPES.PARRY,
];

/**
 * Wild Fleshrending
 * "Shred deals X additional damage, and Swipe (or Brutal Slash) deals Y additional damage, to enemies suffering from your Thrash."
 * The wording is slightly ambiguous but both bonuses require the player's Thrash debuff to be active.
 */
class WildFleshrending extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    enemies: Enemies,
    statTracker: StatTracker,
  };

  shredBonus = 0;
  shredsWithThrash = 0;
  shredsTotal = 0;
  shredDamage = 0;

  swipeBonus = 0;
  swipesWithThrash = 0;
  swipesTotal = 0;
  swipeDamage = 0;

  // Only cast events give us accurate attack power values, so have to temporarily store it. As we're dealing with instant damage abilites there's no problem with that.
  attackPower = 0;

  constructor(...args) {
    super(...args);
    if(!this.selectedCombatant.hasTrait(SPELLS.WILD_FLESHRENDING.id)) {
      this.active = false;
      return;
    }

    this.shredBonus = this.selectedCombatant.traitsBySpellId[SPELLS.WILD_FLESHRENDING.id]
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.WILD_FLESHRENDING.id, rank)[0], 0);
    debug && console.log(`shredBonus from items: ${this.shredBonus}`);

    this.swipeBonus = this.selectedCombatant.traitsBySpellId[SPELLS.WILD_FLESHRENDING.id]
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.WILD_FLESHRENDING.id, rank)[1], 0);
    debug && console.log(`swipeBonus from items: ${this.swipeBonus}`);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.SHRED.id &&
        !SWIPE_SPELLS.includes(event.ability.guid)) {
      return;
    }
    this.attackPower = event.attackPower;
  }

  on_byPlayer_damage(event) {
    if (HIT_TYPES_TO_IGNORE.includes(event.hitType)) {
      // Attacks that don't hit cannot benefit from the trait's bonus
      return;
    }

    const isShred = event.ability.guid === SPELLS.SHRED.id;
    if (!isShred && !SWIPE_SPELLS.includes(event.ability.guid)) {
      // Only interested in shred and swipe
      return;
    }

    if (isShred) {
      this.shredsTotal += 1;
    } else {
      this.swipesTotal += 1;
    }

    const target = this.enemies.getEntities()[event.targetID];
    if (!target || (
        !target.hasBuff(SPELLS.THRASH_FERAL.id, event.timestamp, 0, 0, this.owner.playerId) &&
        !target.hasBuff(SPELLS.THRASH_BEAR_DOT.id, event.timestamp, 0, 0, this.owner.playerId))) {
      // Only applies bonus damage if hitting a target with player's Thrash (either cat or bear version) active on it
      debug && console.log(`${this.owner.formatTimestamp(event.timestamp, 3)} hit without Thrash`);
      return;
    }

    if (isShred) {
      this.shredsWithThrash += 1;
    } else {
      this.swipesWithThrash += 1;
    }

    /**
     * Through in-game testing I've found that the Wild Fleshrending trait's damage is applied like this:
     * damageDone = (attackPower * ABILITY_COEFFICIENT + traitBonus) * modifier
     * 
     * The important thing is that there's just one modifier term applied to both the ability's base damage and to the trait's bonus damage. 
     * The modifier includes things like shred's 20% buff against bleeding targets, Tiger's Fury, Savage Roar, the Feral Druid aura that's used to adjust DPS balance, and even the damage increase from a critical strike. It also includes things that are difficult to see from our logs such as Mystic Touch or encounter-specific effects like MOTHER taking extra damage in the 3rd chamber. The effect of enemy armor is also included within the modifier.
     * We know the damageDone, attackPower, ABILITY_COEFFICIENT, and traitBonus which means we can calculate the modifier's value for this attack. With the modifier known we can multiply that by traitBonus to find how much damage it actually contributed to this attack.
     * 
     * Assumptions: There are no effects in play that adjust damage by a set number rather than by multiplying, apart from those that appear in the log as absorbed damage. Everything that modifies the ability's base damage also modifies the trait's bonus damage in the same way. I've yet to find anything that violates these assumptions.
     */
    
    const traitBonus = isShred ? this.shredBonus : this.swipeBonus;
    const coefficient = this.abilities.getAbility(event.ability.guid).primaryCoefficient;
    const [ traitDamageContribution ] = calculateBonusAzeriteDamage(event, traitBonus, this.attackPower, coefficient);
    if (isShred) {
      this.shredDamage += traitDamageContribution;
      debug && console.log(`${this.owner.formatTimestamp(event.timestamp, 3)} Shred increased by ${traitDamageContribution.toFixed(0)}.`);
    } else {
      this.swipeDamage += traitDamageContribution;
      debug && console.log(`${this.owner.formatTimestamp(event.timestamp, 3)} Swipe (or BrS) increased by ${traitDamageContribution.toFixed(0)}.`);
    }

    // As an accuracy check, during debug also calculate the trait's damage bonus using a method based on that used for Frost Mage's Whiteout trait.
    if (debug) {
      const critMultiplier = this.selectedCombatant.race === RACES.Tauren ? 2.04 : 2.00;
      const externalModifier = (event.amount / event.unmitigatedAmount) / (event.hitType === HIT_TYPES.CRIT ? critMultiplier : 1.0);
      console.log(`externalModifier: ${externalModifier.toFixed(3)}`);

      let estimatedDamage = traitBonus * (1 + this.statTracker.currentVersatilityPercentage) * FERAL_DRUID_DAMAGE_AURA;
      if (event.ability.guid === SPELLS.SHRED.id || event.ability.guid === SPELLS.SWIPE_CAT.id) {
        estimatedDamage *= SHRED_SWIPE_BONUS_ON_BLEEDING;
      }
      if (isShred && this.selectedCombatant.hasBuff(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id)) {
        estimatedDamage *= INCARNATION_SHRED_DAMAGE;
      }
      if (this.selectedCombatant.hasTalent(SPELLS.MOMENT_OF_CLARITY_TALENT.id) && this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_FERAL.id, event.timestamp, 500)) {
        estimatedDamage *= 1 + MOMENT_OF_CLARITY_DAMAGE_BONUS;
      }
      if (this.selectedCombatant.hasBuff(SPELLS.TIGERS_FURY.id)) {
        estimatedDamage *= 1 + TIGERS_FURY_DAMAGE_BONUS;
      }
      if (this.selectedCombatant.hasBuff(SPELLS.BLOODTALONS_BUFF.id, null, 100)) {
        estimatedDamage *= 1 + BLOODTALONS_DAMAGE_BONUS;
      }
      if (this.selectedCombatant.hasBuff(SPELLS.SAVAGE_ROAR_TALENT.id)) {
        estimatedDamage *= 1 + SAVAGE_ROAR_DAMAGE_BONUS;
      }
      if (event.hitType === HIT_TYPES.CRIT) {
        estimatedDamage *= critMultiplier;
      }
      estimatedDamage *= externalModifier;
      console.log(`estimatedDamage: ${estimatedDamage.toFixed(0)}`);

      const variation = estimatedDamage / traitDamageContribution;
      console.log(`Matching of contribution calculations: ${(variation * 100).toFixed(1)}%`);
    }
  }

  statistic() {
    const swipeName = this.selectedCombatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id) ? 'Brutal Slash' : 'Swipe';
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.WILD_FLESHRENDING.id}
        value={(
          <ItemDamageDone amount={this.shredDamage + this.swipeDamage} />
        )}
        tooltip={`The Wild Fleshrending trait increased your Shred damage by a total of <b>${formatNumber(this.shredDamage)}</b> and ${swipeName} by <b>${formatNumber(this.swipeDamage)}</b>.
          <li><b>${(100 * this.shredsWithThrash / this.shredsTotal).toFixed(0)}%</b> of your Shreds benefited from Wild Fleshrending.
          <li><b>${(100 * this.swipesWithThrash / this.swipesTotal).toFixed(0)}%</b> of your ${swipeName}s benefited from Wild Fleshrending.`}
      />
    );
  }

  get shredBenefitThresholds() {
    return {
      actual: this.shredsTotal === 0 ? 1 : this.shredsWithThrash / this.shredsTotal,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  get swipeBenefitThresholds() {
    return {
      actual: this.swipesTotal === 0 ? 1 : this.swipesWithThrash / this.swipesTotal,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.shredBenefitThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          You're not getting the full benefit of your <SpellLink id={SPELLS.WILD_FLESHRENDING.id} /> Azerite trait on <SpellLink id={SPELLS.SHRED.id} />. To receive the trait's bonus damage you must have <SpellLink id={SPELLS.THRASH_FERAL.id} /> active on the target when you hit it with <SpellLink id={SPELLS.SHRED.id} />.
        </>
      )
        .icon(SPELLS.WILD_FLESHRENDING.icon)
        .actual(`${(actual * 100).toFixed(0)}% of Shreds benefited from Wild Fleshrending.`)
        .recommended(`>${(recommended * 100).toFixed(0)}% is recommended`);
    });

    const swipeSpell = this.selectedCombatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id) ? SPELLS.BRUTAL_SLASH_TALENT : SPELLS.SWIPE_CAT;
    when(this.swipeBenefitThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          You're not getting the full benefit of your <SpellLink id={SPELLS.WILD_FLESHRENDING.id} /> Azerite trait on <SpellLink id={swipeSpell.id} />. To receive the trait's bonus damage you must have <SpellLink id={SPELLS.THRASH_FERAL.id} /> active on the target when you hit it with <SpellLink id={swipeSpell.id} />.
        </>
      )
        .icon(SPELLS.WILD_FLESHRENDING.icon)
        .actual(`${(actual * 100).toFixed(0)}% of ${swipeSpell.name} hits benefited from Wild Fleshrending.`)
        .recommended(`>${(recommended * 100).toFixed(0)}% is recommended`);
    });
  }
}

export default WildFleshrending;
