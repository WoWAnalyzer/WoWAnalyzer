import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemHealingDone from 'Main/ItemHealingDone';
import ItemDamageDone from 'Main/ItemDamageDone';

import isAtonement from '../Core/isAtonement';
import Penance from '../Spells/Penance';

const TIER_20_TWO_SET_BONUS = 0.65;

class Tier20_2set extends Analyzer {
  static dependencies = {
    penance: Penance, // we need this to add `penanceBoltNumber` to the damage and heal events
  };

  _firstPenanceBoltLastDamageEvent = false;

  healing = 0;
  damage = 0;

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasBuff(SPELLS.DISC_PRIEST_T20_2SET_BONUS_PASSIVE.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.PENANCE.id || event.penanceBoltNumber !== 0) {
      this._firstPenanceBoltLastDamageEvent = false;
      return;
    }

    this._firstPenanceBoltLastDamageEvent = true;
    this.damage += calculateEffectiveDamage(event, TIER_20_TWO_SET_BONUS);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PENANCE_HEAL.id) {
      if (event.penanceBoltNumber === 0) {
        this.healing += calculateEffectiveHealing(event, TIER_20_TWO_SET_BONUS);
      }
    }

    // Atonement
    if (isAtonement(event)) {
      if (this._firstPenanceBoltLastDamageEvent) {
        this.healing += calculateEffectiveHealing(event, TIER_20_TWO_SET_BONUS);
      }
    }
  }

  item() {
    const healing = this.healing || 0;
    const damage = this.damage || 0;

    return {
      id: `spell-${SPELLS.DISC_PRIEST_T20_2SET_BONUS_PASSIVE.id}`,
      icon: <SpellIcon id={SPELLS.DISC_PRIEST_T20_2SET_BONUS_PASSIVE.id} />,
      title: <SpellLink id={SPELLS.DISC_PRIEST_T20_2SET_BONUS_PASSIVE.id} icon={false} />,
      result: (
        <React.Fragment>
          <ItemDamageDone amount={damage} /><br />
          <ItemHealingDone amount={healing} />
        </React.Fragment>
      ),
    };
  }
}

export default Tier20_2set;
