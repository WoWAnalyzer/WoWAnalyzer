import React from 'react';

import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { calculateAzeriteEffects } from 'common/stats';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import Enemies from 'parser/shared/modules/Enemies';
import StatTracker from 'parser/shared/modules/StatTracker';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/ItemDamageDone';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import Events from 'parser/core/Events';

import { AFFECTED_SPELLS as UNTAMED_FEROCITY_SPELLS, calcBonus as calcUntamedFerocityBonus } from "./UntamedFerocity";
import Abilities from '../Abilities';

const debug = false;
// Swipe has a bear and a cat version, both are affected by the trait. It can be replaced by the talent Brutal Slash which benefits in the same way.
export const SWIPE_SPELLS = [
  SPELLS.SWIPE_BEAR,
  SPELLS.SWIPE_CAT,
  SPELLS.BRUTAL_SLASH_TALENT,
];
const HIT_TYPES_TO_IGNORE = [
  HIT_TYPES.MISS,
  HIT_TYPES.DODGE,
  HIT_TYPES.PARRY,
];

export function isAffectedByWildFleshrending(damageEvent, owner, enemies) {
  if (!(damageEvent.ability.guid === SPELLS.SHRED.id) && !SWIPE_SPELLS.map(spell => spell.id).includes(damageEvent.ability.guid)) {
    // Only shred and swipe spells can be affected
    return false;
  }
  const target = enemies.getEntities()[damageEvent.targetID];
  if (!target || (
      !target.hasBuff(SPELLS.THRASH_FERAL.id, damageEvent.timestamp, 0, 0, owner.playerId) &&
      !target.hasBuff(SPELLS.THRASH_BEAR_DOT.id, damageEvent.timestamp, 0, 0, owner.playerId))) {
    // The target must have the player's Thrash active
    return false;
  }
  return true;
}
export function calcShredBonus(combatant) {
  if (!combatant.hasTrait(SPELLS.WILD_FLESHRENDING.id)) {
    return 0;
  }
  return combatant.traitsBySpellId[SPELLS.WILD_FLESHRENDING.id]
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.WILD_FLESHRENDING.id, rank)[0], 0);
}
export function calcSwipeBonus(combatant) {
  if (!combatant.hasTrait(SPELLS.WILD_FLESHRENDING.id)) {
    return 0;
  }
  return combatant.traitsBySpellId[SPELLS.WILD_FLESHRENDING.id]
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.WILD_FLESHRENDING.id, rank)[1], 0);
}

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

  // Untamed Ferocity is another azerite trait that increases shred and swipe damage, so needs to be accounted for.
  untamedFerocityBonus = 0;

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
    if (!this.selectedCombatant.hasTrait(SPELLS.WILD_FLESHRENDING.id)) {
      this.active = false;
      return;
    }

    this.shredBonus = calcShredBonus(this.selectedCombatant);
    this.swipeBonus = calcSwipeBonus(this.selectedCombatant);
    this.untamedFerocityBonus = calcUntamedFerocityBonus(this.selectedCombatant);
    debug && this.log(`untamedFerocityBonus: ${this.untamedFerocityBonus}, shredBonus: ${this.shredBonus}, swipeBonus: ${this.swipeBonus}`);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.SHRED, ...SWIPE_SPELLS]), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.SHRED, ...SWIPE_SPELLS]), this.onDamage);
  }

  onCast(event) {
    this.attackPower = event.attackPower;
  }

  onDamage(event) {
    if (HIT_TYPES_TO_IGNORE.includes(event.hitType)) {
      // Attacks that don't hit cannot benefit from the trait's bonus
      return;
    }

    const isShred = event.ability.guid === SPELLS.SHRED.id;

    if (isShred) {
      this.shredsTotal += 1;
    } else {
      this.swipesTotal += 1;
    }

    if (!isAffectedByWildFleshrending(event, this.owner, this.enemies)) {
      debug && this.log('hit without Thrash');
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
     *
     * With the addition of Untamed Ferocity that damage bonus needs to be accounted for too:
     * damageDone = (attackPower * ABILITY_COEFFICIENT + wildFleshrendingBonus + untamedFerocityBonus) * modifier
     */

    const traitBonus = isShred ? this.shredBonus : this.swipeBonus;
    // there are situations such as using Bear's Swipe ability where Wild Fleshrending is active and Untamed Ferocity is not
    const otherBonus = UNTAMED_FEROCITY_SPELLS.map(spell => spell.id).includes(event.ability.guid) ? this.untamedFerocityBonus : 0;
    const coefficient = this.abilities.getAbility(event.ability.guid).primaryCoefficient;
    const [ traitDamageContribution ] = calculateBonusAzeriteDamage(event, [traitBonus, otherBonus], this.attackPower, coefficient);
    if (isShred) {
      this.shredDamage += traitDamageContribution;
      debug && this.log(`Shred increased by ${traitDamageContribution.toFixed(0)}.`);
    } else {
      this.swipeDamage += traitDamageContribution;
      debug && this.log(`Swipe (or BrS) increased by ${traitDamageContribution.toFixed(0)}.`);
    }
  }

  statistic() {
    const swipeName = this.selectedCombatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id) ? 'Brutal Slash' : 'Swipe';
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.WILD_FLESHRENDING.id}
        value={<ItemDamageDone amount={this.shredDamage + this.swipeDamage} />}
        tooltip={(
          <>
            Increased your Shred damage by a total of <b>{formatNumber(this.shredDamage)}</b> and {swipeName} by <b>{formatNumber(this.swipeDamage)}</b>.<br />

            <ul>
              <li><b>{(100 * this.shredsWithThrash / this.shredsTotal).toFixed(0)}%</b> of your Shreds benefited from Wild Fleshrending.</li>
              <li><b>{(100 * this.swipesWithThrash / this.swipesTotal).toFixed(0)}%</b> of your {swipeName}s benefited from Wild Fleshrending.</li>
            </ul>
          </>
        )}
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
    when(this.shredBenefitThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          You're not getting the full benefit of your <SpellLink id={SPELLS.WILD_FLESHRENDING.id} /> Azerite trait on <SpellLink id={SPELLS.SHRED.id} />. To receive the trait's bonus damage you must have <SpellLink id={SPELLS.THRASH_FERAL.id} /> active on the target when you hit it with <SpellLink id={SPELLS.SHRED.id} />.
        </>,
      )
        .icon(SPELLS.WILD_FLESHRENDING.icon)
        .actual(i18n._(t('druid.feral.suggestions.wildFleshrending.shredsBuffed')`${(actual * 100).toFixed(0)}% of Shreds benefited from Wild Fleshrending.`))
        .recommended(`>${(recommended * 100).toFixed(0)}% is recommended`));

    const swipeSpell = this.selectedCombatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id) ? SPELLS.BRUTAL_SLASH_TALENT : SPELLS.SWIPE_CAT;
    when(this.swipeBenefitThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          You're not getting the full benefit of your <SpellLink id={SPELLS.WILD_FLESHRENDING.id} /> Azerite trait on <SpellLink id={swipeSpell.id} />. To receive the trait's bonus damage you must have <SpellLink id={SPELLS.THRASH_FERAL.id} /> active on the target when you hit it with <SpellLink id={swipeSpell.id} />.
        </>,
      )
        .icon(SPELLS.WILD_FLESHRENDING.icon)
        .actual(i18n._(t('druid.feral.suggestions.wildFleshrending.swipeBuffed')`${(actual * 100).toFixed(0)}% of ${swipeSpell.name} hits benefited from Wild Fleshrending.`))
        .recommended(`>${(recommended * 100).toFixed(0)}% is recommended`));
  }
}

export default WildFleshrending;
