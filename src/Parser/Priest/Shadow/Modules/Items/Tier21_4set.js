import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Main/ItemDamageDone';

const SET_INCREASE_CRIT_CHANCE_PER_VOIDFORM_STACK = 0.5;
const CRIT_TO_HIT_MODIFIER = 2.5; // +50% from tier 21 2p set

class Tier21_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDamage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.SHADOW_PRIEST_T21_4SET_BONUS_PASSIVE.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    const combatant = this.combatants.selected;

    if (spellId !== SPELLS.MIND_BLAST.id && spellId !== SPELLS.MIND_FLAY.id) return;
    if (!combatant.hasBuff(SPELLS.VOIDFORM_BUFF.id)) return;

    const { stacks: currentVoidformStacks } = combatant.getBuff(SPELLS.VOIDFORM_BUFF.id);
    const increasedCritChance = currentVoidformStacks * SET_INCREASE_CRIT_CHANCE_PER_VOIDFORM_STACK / 100;

    const critChanceWithoutSet = 1 + combatant.critPercentage;
    const critChanceWithSet = increasedCritChance + critChanceWithoutSet;

    const hitDamage = event.hitType === HIT_TYPES.CRIT ? (calculateEffectiveDamage(event, 1) / CRIT_TO_HIT_MODIFIER) : (calculateEffectiveDamage(event, 1));

    const averageDamageWithoutSet = hitDamage * critChanceWithoutSet;
    // ignore added critdamage from Tier21_2set, to estimate the power of 4 piece bonus only:
    const averageDamageWithSet = hitDamage * critChanceWithSet;

    this.bonusDamage += averageDamageWithSet - averageDamageWithoutSet;
  }

  item() {
    return {
      id: `spell-${SPELLS.SHADOW_PRIEST_T21_4SET_BONUS_PASSIVE.id}`,
      icon: <SpellIcon id={SPELLS.SHADOW_PRIEST_T21_4SET_BONUS_PASSIVE.id} />,
      title: <SpellLink id={SPELLS.SHADOW_PRIEST_T21_4SET_BONUS_PASSIVE.id} />,
      result: (
        <dfn data-tip="This is an estimate and only reflects the damage gained from the crit chance gained. Having this bonus also increases the power of Tier 21 2P Bonus.">
          <ItemDamageDone amount={this.bonusDamage} approximate />
        </dfn>
      ),
    };
  }
}

export default Tier21_4set;
