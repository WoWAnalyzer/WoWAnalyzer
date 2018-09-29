import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import HIT_TYPES from 'parser/core/HIT_TYPES';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/core/modules/StatTracker';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import ItemDamageDone from 'interface/others/ItemDamageDone';

const SET_INCREASE_CRIT_CHANCE_PER_VOIDFORM_STACK = 0.5;
const CRIT_TO_HIT_MODIFIER = 2.5; // +50% from tier 21 2p set
const CRIT_TO_HIT_MODIFIER_VOIDBOLT = 2.0; // voidbolt does not profit from t21 2pc

class Tier21_4set extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  bonusDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBuff(SPELLS.SHADOW_PRIEST_T21_4SET_BONUS_PASSIVE.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    const combatant = this.selectedCombatant;

    if (spellId !== SPELLS.MIND_BLAST.id && spellId !== SPELLS.MIND_FLAY.id && spellId !== SPELLS.VOID_BOLT.id) {
      return;
    }
    if (!combatant.hasBuff(SPELLS.VOIDFORM_BUFF.id)) {
      return;
    }

    const { stacks: currentVoidformStacks } = combatant.getBuff(SPELLS.VOIDFORM_BUFF.id);
    const increasedCritChance = currentVoidformStacks * SET_INCREASE_CRIT_CHANCE_PER_VOIDFORM_STACK / 100;

    const critChanceWithoutSet = 1 + this.statTracker.currentCritPercentage;
    const critChanceWithSet = increasedCritChance + critChanceWithoutSet;
    let hitDamage = 0.0;

    if (spellId !== SPELLS.VOID_BOLT.id) {
      hitDamage = event.hitType === HIT_TYPES.CRIT ? (calculateEffectiveDamage(event, 1) / CRIT_TO_HIT_MODIFIER) : (calculateEffectiveDamage(event, 1));
    }
    else {
      hitDamage = event.hitType === HIT_TYPES.CRIT ? (calculateEffectiveDamage(event, 1) / CRIT_TO_HIT_MODIFIER_VOIDBOLT) : (calculateEffectiveDamage(event, 1));
    }
    const averageDamageWithoutSet = hitDamage * critChanceWithoutSet;
    // ignore added critdamage from Tier21_2set, to estimate the power of 4 piece bonus only:
    const averageDamageWithSet = hitDamage * critChanceWithSet;

    this.bonusDamage += averageDamageWithSet - averageDamageWithoutSet;
  }

  item() {
    return {
      id: `spell-${SPELLS.SHADOW_PRIEST_T21_4SET_BONUS_PASSIVE.id}`,
      icon: <SpellIcon id={SPELLS.SHADOW_PRIEST_T21_4SET_BONUS_PASSIVE.id} />,
      title: <SpellLink id={SPELLS.SHADOW_PRIEST_T21_4SET_BONUS_PASSIVE.id} icon={false} />,
      result: (
        <dfn data-tip="This is an estimate and only reflects the damage gained from the crit chance gained. Having this bonus also increases the power of Tier 21 2P Bonus.">
          <ItemDamageDone amount={this.bonusDamage} approximate />
        </dfn>
      ),
    };
  }
}

export default Tier21_4set;
