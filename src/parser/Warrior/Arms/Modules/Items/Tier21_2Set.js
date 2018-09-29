import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Analyzer from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import HIT_TYPES from 'parser/core/HIT_TYPES';

import ItemDamageDone from 'interface/others/ItemDamageDone';

const CRIT_DAMAGE_MODIFIER = 0.07;

class Tier21_2Set extends Analyzer {
  damageDone = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBuff(SPELLS.WARRIOR_ARMS_T21_2P_BONUS.id);
  }

  on_byPlayer_damage(event) {
    if(event.hitType === HIT_TYPES.CRIT && this.selectedCombatant.hasBuff(SPELLS.WAR_VETERAN.id)) {
      // Add War Veteran contributed critical damage to the total.
      this.damageDone += calculateEffectiveDamage(event, CRIT_DAMAGE_MODIFIER);
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.WARRIOR_ARMS_T21_2P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.WARRIOR_ARMS_T21_2P_BONUS.id} />,
      title: <SpellLink id={SPELLS.WARRIOR_ARMS_T21_2P_BONUS.id} icon={false} />,
      result: <ItemDamageDone amount={this.damageDone} />,
    };
  }
}

export default Tier21_2Set;
