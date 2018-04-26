import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Abilities from 'Parser/Core/Modules/Abilities';
import ItemHealingDone from 'Main/ItemHealingDone';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Ishkars Felshield Emitter -
 * Use: Place a Felshield on an ally, absorbing [2416491 * (1 + Versatility)] damage for 9 sec. When the shield is consumed or expires, it explodes dealing 50% of the absorbed damage as Fire split amongst all enemies within 8 yds. (1 Min Cooldown)
 */
class IshkarsFelshieldEmitter extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
  };

  damageAbsorbed = 0;
  damageDealt = 0;

  on_initialized() {
    const selectedCombatant = this.combatants.selected;
    this.active = selectedCombatant.hasTrinket(ITEMS.ISHKARS_FELSHIELD_EMITTER.id);

    if (this.active) {
      this.abilities.add({
        spell: SPELLS.FELSHIELD_ABSORB,
        name: ITEMS.ISHKARS_FELSHIELD_EMITTER.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.owner.getPercentageOfTotalHealingDone(this.damageAbsorbed),
      isLessThan: {
        minor: 0.04,
        average: 0.035,
        major: 0.025,
      },
      style: 'percentage',
    };
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.FELSHIELD_ABSORB.id) {
      this.damageAbsorbed += event.amount;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.FELSHIELD_DAMAGE.id) {
      this.damageDealt += event.amount + (event.absorbed || 0);
    }
  }

  item() {
    return {
      item: ITEMS.ISHKARS_FELSHIELD_EMITTER,
      result: (
        <React.Fragment>
          <ItemDamageDone amount={this.damageDealt} /><br />
          <ItemHealingDone amount={this.damageAbsorbed} />
        </React.Fragment>
      ),
    };
  }
}

export default IshkarsFelshieldEmitter;
