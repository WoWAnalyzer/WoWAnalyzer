import React from 'react';

import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import StatTracker from 'parser/shared/modules/StatTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';

import Events from 'parser/core/Events';

import { calcShredBonus, calcSwipeBonus, isAffectedByWildFleshrending } from "./WildFleshrending";
import Abilities from '../Abilities.js';

const debug = false;
export const AFFECTED_SPELLS = [
  SPELLS.RAKE,
  SPELLS.SHRED,
  SPELLS.MOONFIRE_FERAL,
  SPELLS.THRASH_FERAL,
  SPELLS.SWIPE_CAT,
  SPELLS.BRUTAL_SLASH_TALENT,
];
const HIT_TYPES_TO_IGNORE = [
  HIT_TYPES.MISS,
  HIT_TYPES.DODGE,
  HIT_TYPES.PARRY,
];

const COOLDOWN_REDUCTION_BERSERK = 300;
const COOLDOWN_REDUCTION_INCARNATION = 200;

export function calcBonus(combatant) {
  if (!combatant.hasTrait(SPELLS.UNTAMED_FEROCITY.id)) {
    return 0;
  }
  return combatant.traitsBySpellId[SPELLS.UNTAMED_FEROCITY.id]
    .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.UNTAMED_FEROCITY.id, rank)[0], 0);
}

/**
 * Untamed Ferocity
 * Combo-point generating abilities deal X additional instant damage and reduce the cooldown of
 * Berserk by 0.3 sec [or Incarnation: King of the Jungle by 0.2 sec]
 *
 * Test Log: /report/ABH7D8W1Qaqv96mt/2-Mythic+Taloc+-+Kill+(4:12)/Enicat/statistics
 */
class UntamedFerocity extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    enemies: Enemies,
    statTracker: StatTracker,
    spellUsable: SpellUsable,
  };

  hasWildFleshrending = false;
  shredBonus = 0;
  swipeBonus = 0;
  untamedBonus = 0;
  untamedDamage = 0;

  hasIncarnation = false;
  cooldownId = 0;
  cooldownReduction = 0;

  // Only cast events (not damage events) give attack power values, so have to temporarily store it. As we're dealing with instant damage abilites there's no problem with that.
  attackPower = 0;

  constructor(...args) {
    super(...args);
    if(!this.selectedCombatant.hasTrait(SPELLS.UNTAMED_FEROCITY.id)) {
      this.active = false;
      return;
    }
    this.untamedBonus = calcBonus(this.selectedCombatant);

    this.hasWildFleshrending = this.selectedCombatant.hasTrait(SPELLS.WILD_FLESHRENDING.id);
    if (this.hasWildFleshrending) {
      this.shredBonus = calcShredBonus(this.selectedCombatant);
      this.swipeBonus = calcSwipeBonus(this.selectedCombatant);
    }
    debug && this.log(`untamedBonus: ${this.untamedBonus}, shredBonus: ${this.shredBonus}, swipeBonus: ${this.swipeBonus}`);

    this.hasIncarnation = this.selectedCombatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id);
    this.cooldownId = this.hasIncarnation ? SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id : SPELLS.BERSERK.id;
    this.cooldownReductionPerHit = this.hasIncarnation ? COOLDOWN_REDUCTION_INCARNATION : COOLDOWN_REDUCTION_BERSERK;

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(AFFECTED_SPELLS), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(AFFECTED_SPELLS), this.onDamage);
  }

  onCast(event) {
    this.attackPower = event.attackPower;
  }

  onDamage(event) {
    if (event.tick || HIT_TYPES_TO_IGNORE.includes(event.hitType)) {
      // only interested in direct damage from whitelisted spells which hit the target
      return;
    }

    if (this.hasWildFleshrending && isAffectedByWildFleshrending(event, this.owner, this.enemies)) {
      // if the ability was given bonus damage from both Wild Fleshrending and Untamed Ferocity need to account for that to accurately attribute damage to each.
      const fleshrendingBonus = (event.ability.guid === SPELLS.SHRED.id) ? this.shredBonus : this.swipeBonus;
      const coefficient = this.abilities.getAbility(event.ability.guid).primaryCoefficient;
      const [traitDamageContribution] = calculateBonusAzeriteDamage(event, [this.untamedBonus, fleshrendingBonus], this.attackPower, coefficient);
      this.untamedDamage += traitDamageContribution;
      debug && this.log(`Affected ability including Wild Fleshrending, damage from Untamed Ferocity: ${traitDamageContribution}`);
    } else {
      const coefficient = this.abilities.getAbility(event.ability.guid).primaryCoefficient;
      const [traitDamageContribution] = calculateBonusAzeriteDamage(event, [this.untamedBonus], this.attackPower, coefficient);
      this.untamedDamage += traitDamageContribution;
      debug && this.log(`Affected ability damage from Untamed Ferocity: ${traitDamageContribution}`);
    }

    if (this.spellUsable.isOnCooldown(this.cooldownId)) {
      this.cooldownReduction += this.cooldownReductionPerHit;
      this.spellUsable.reduceCooldown(this.cooldownId, this.cooldownReductionPerHit);
    }
  }

  statistic() {
    const cooldownName = this.hasIncarnation ? 'Incarnation' : 'Berserk';
    const cooldownDuration = this.abilities.getExpectedCooldownDuration(this.cooldownId);
    const basePossibleCasts = Math.floor(this.owner.fightDuration / cooldownDuration) + 1;
    const improvedPossibleCasts = Math.floor((this.owner.fightDuration + this.cooldownReduction) / cooldownDuration) + 1;
    const extraCastsPossible = improvedPossibleCasts - basePossibleCasts;
    const extraCastsComment = (improvedPossibleCasts === basePossibleCasts) ? `This wasn't enough to allow any extra casts during the fight, but may have given you more freedom in timing those casts.` : <>This gave you the opportunity over the duration of the fight to use {cooldownName} <b>{extraCastsPossible}</b> extra time{extraCastsPossible === 1 ? '' : 's'}.</>;

    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
            Increased the damage of your combo point generators by a total of <b>{formatNumber(this.untamedDamage)}</b><br />
            The cooldown on your {cooldownName} was reduced by a total of <b>{(this.cooldownReduction / 1000).toFixed(1)}</b> seconds.<br />
            {extraCastsComment}
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.UNTAMED_FEROCITY}>
          <ItemDamageDone amount={this.untamedDamage} /><br />
          {(this.cooldownReduction / 1000).toFixed(1)}s <small>cooldown reduction</small>
        </BoringSpellValueText>
      </ItemStatistic>
    );
  }
}

export default UntamedFerocity;
