import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

const DAMAGE_MODIFIER = 0.08;

class PromiseOfElune extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  solarWrathDamage = 0;
  lunarStrikeDamage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFeet(ITEMS.PROMISE_OF_ELUNE.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid === SPELLS.SOLAR_WRATH_MOONKIN.id) {
      this.solarWrathDamage += calculateEffectiveDamage(event, DAMAGE_MODIFIER);
    }
    if (event.ability.guid === SPELLS.LUNAR_STRIKE.id) {
      this.lunarStrikeDamage += calculateEffectiveDamage(event, DAMAGE_MODIFIER);
    }     
  }

  get bonusDamage() {
    return this.solarWrathDamage + this.lunarStrikeDamage;
  }

  item() {
    return {
      item: ITEMS.PROMISE_OF_ELUNE,
      result: (
        <dfn data-tip={`Damage Breakdown:
          <ul>
            <li>Solar Wrath: <b>${this.owner.formatItemDamageDone(this.solarWrathDamage)}</b></li>
            <li>Lunar Strike: <b>${this.owner.formatItemDamageDone(this.lunarStrikeDamage)}</b></li>
          </ul>
        `}>
          <ItemDamageDone amount={this.bonusDamage} />
        </dfn>
      ),
    };
  }
}

export default PromiseOfElune;
