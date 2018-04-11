import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

import getDamageBonus from "Parser/Hunter/Shared/Modules/getDamageBonus";
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Main/ItemDamageDone';

const TRICK_SHOT_MODIFIER = 0.15;

/**
 * Aimed Shot will now also ricochet and hit all Vulnerable targets for 30% of normal damage.
 * If there are no other Vulnerable targets, the damage of your next Aimed Shot is increased by 15%.
 */
class TrickShot extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.TRICK_SHOT_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.TRICK_SHOT_BUFF.id)) {
      this.bonusDmg += getDamageBonus(event, TRICK_SHOT_MODIFIER);
    }
  }

  subStatistic() {
    if (this.bonusDmg > 0) {
      return (
        <div className="flex">
          <div className="flex-main">
            <SpellLink id={SPELLS.TRICK_SHOT_TALENT.id}>
              Trick Shot ST
            </SpellLink>
          </div>
          <div className="flex-sub text-right">
            <ItemDamageDone amount={this.bonusDmg} />
          </div>
        </div>
      );
    }
  }
}

export default TrickShot;
