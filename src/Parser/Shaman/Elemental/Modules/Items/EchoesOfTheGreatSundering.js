import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import ItemIcon from 'common/ItemIcon';
import ItemLink from 'common/ItemLink';
import ItemDamageDone from 'Main/ItemDamageDone';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';

class EchoesOfTheGreatSundering extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  buffedEarthquakeCasts = 0;
  echoesProcsCounter = 0;
  unbuffedEarthquakeDamage = 0;
  buffedEarthquakeDamage = 0;
  totalEarthquakeCasts = 0;

  state = 0;
  endtime = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.ECHOES_OF_THE_GREAT_SUNDERING.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.EARTHQUAKE.id)
      return;

    if (this.combatants.selected.hasBuff(SPELLS.ECHOES_OF_THE_GREAT_SUNDERING_BUFF.id, event.timestamp)) {
      this.endtime = event.timestamp + 6000 + 150; //timestamp+duration+buffer; buffer can be as big as necessary but let's try 150
      this.state = 1;
    }
    else if (this.timestamp < this.endtime)
      this.state = 2;
  }

  on_byPlayer_damage(event) {
    if (event.timestamp > this.endtime)
      this.state = 0;

    const spellId = event.ability.guid;
    if (spellId !== SPELLS.EARTHQUAKE_DAMAGE.id)
      return;

    const critMultiplier = (event.hitType === HIT_TYPES.CRIT) ? 2 : 1;
    const normalizedDamage = event.amount / critMultiplier;
    switch (this.state) {
      case 0:
        this.unbuffedNormalizedEarthquakeDamage += normalizedDamage;
        break;
      case  1:
        this.buffedEarthquakeDamage += event.amount;
        this.buffedNormalizedEarthquakeDamage += normalizedDamage;
        break;
      default:
        if (this.buffedNormalizedEarthquakeDamage !== 0) {
          if (Math.abs(normalizedDamage / this.buffedNormalizedEarthquakeDamage) < 0.2) {
            this.buffedEarthquakeDamage += event.amount;
          }
          else if (this.unbuffedNormalizedEarthquakeDamage !== 0) {
            if (Math.abs(normalizedDamage / this.unbuffedNormalizedEarthquakeDamage) > 0.2) {
              this.buffedEarthquakeDamage += event.amount;
            }
          }
        }
        break;
    }
  }

  item() {
    return {
      id: `item=${ITEMS.ECHOES_OF_THE_GREAT_SUNDERING.id}`,
      icon: <ItemIcon id={ITEMS.ECHOES_OF_THE_GREAT_SUNDERING.id} />,
      title: <ItemLink id={ITEMS.ECHOES_OF_THE_GREAT_SUNDERING.id} />,
      result: (
        <dfn data-tip={``}>
          <ItemDamageDone amount={this.buffedEarthquakeDamage} />
        </dfn>
      ),
    };
  }
}

export default EchoesOfTheGreatSundering;
