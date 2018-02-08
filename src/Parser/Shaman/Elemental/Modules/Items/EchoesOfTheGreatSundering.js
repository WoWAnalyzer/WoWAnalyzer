import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import ItemIcon from 'common/ItemIcon';
import ItemLink from 'common/ItemLink';
//import { formatPercentage } from 'common/format';
import ItemDamageDone from 'Main/ItemDamageDone';

class EchoesOfTheGreatSundering extends Analyzer {
    static dependencies = {
        combatants: Combatants,
    };

    buffedEarthquakeCasts = 0;
    echoesProcsCounter = 0;
    unbuffedEarthquakeDamage = 0;
  buffedEarthquakeDamage = 0;
    totalEarthquakeCasts = 0;

    state=0;
  endtime = 0;

    on_initialized() {
        this.active = this.combatants.selected.hasShoulder(ITEMS.ECHOES_OF_THE_GREAT_SUNDERING.id);
    }

    on_byPlayer_cast(event) {
      const spellId = event.ability.guid;
      if (spellId !== SPELLS.EARTHQUAKE.id)
          return;
      if (this.combatants.selected.hasBuff(SPELLS.ECHOES_OF_THE_GREAT_SUNDERING_BUFF.id, event.timestamp)) {
        this.endtime = event.timestamp + 6100;
        this.state = 1;
      }
        else if (this.timestamp < this.endtime)
            this.state=2;
    }

    on_byPlayer_damage(event) {
      if(event.timestamp>this.endtime)
        this.state=0;
      const spellId = event.ability.guid;
      if (spellId !== SPELLS.EARTHQUAKE_DAMAGE.id)
        return;

      if(this.state===0) {
        this.unbuffedNormalizedEarthquakeDamage += event.amount/event.hitType;
      }
      if (this.state === 1) {
        this.buffedEarthquakeDamage += event.amount;
        this.buffedNormalizedEarthquakeDamage += event.amount / event.hitType;
      }
      if (this.state === 2) {
        if (this.buffedNormalizedEarthquakeDamage !== 0) {
          if (Math.abs((event.amount / event.hitType) / this.buffedNormalizedEarthquakeDamage) < 0.2) {
            this.buffedEarthquakeDamage += event.amount;
          }
        }
        else if (this.unbuffedNormalizedEarthquakeDamage !== 0) {
          if (Math.abs((event.amount / event.hitType) / this.unbuffedNormalizedEarthquakeDamage) > 0.2) {
            this.buffedEarthquakeDamage += event.amount;
          }
        }
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
