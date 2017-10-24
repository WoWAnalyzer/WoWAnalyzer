import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const GUARDIAN_DAMAGE_REDUCTION = 0.06;
const EKOWRAITH_INCREASED_EFFECT = 1.75;

class Ekowraith extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;
  damageReduction = 0;
  hasGuardianAffinity = false;

  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.EKOWRAITH_CREATOR_OF_WORLDS.id);
    this.hasGuardianAffinity = this.combatants.selected.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_SHARED.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const amount = event.amount + (event.absorbed || 0);

    if (spellId === SPELLS.YSERAS_GIFT_OTHERS.id || spellId === SPELLS.YSERAS_GIFT_SELF.id) {
      this.healing += (amount - (amount / EKOWRAITH_INCREASED_EFFECT));
    }
  }

  on_toPlayer_damage(event) {
    // TODO does damage taken also have an 'absorbed' amount that must be accounted for?
    if (this.hasGuardianAffinity) {
      // TODO is this calculation correct?
      const damage = event.amount + (event.absorbed || 0);
      this.damageReduction += damage * ((GUARDIAN_DAMAGE_REDUCTION * EKOWRAITH_INCREASED_EFFECT) - GUARDIAN_DAMAGE_REDUCTION);
    }
  }

  item() {
    return {
      item: ITEMS.EKOWRAITH_CREATOR_OF_WORLDS,
      result: (
        <dfn data-tip={`This is the healing attributable to the bonus to Ysera's Gift.
        ${!this.hasGuardianAffinity ? '' :
        ` <b>In addition, the damage reduction attributable to the boosted strength of Guardian Affinity prevented the equivalent of ${this.owner.formatItemHealingDone(this.damageReduction)}</b>`}
        `}>
          {this.owner.formatItemHealingDone(this.healing)}
        </dfn>
      ),
    };
  }

}

export default Ekowraith;
