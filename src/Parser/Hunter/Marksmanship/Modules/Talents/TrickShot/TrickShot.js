import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import getDamageBonus from "Parser/Hunter/Shared/Modules/getDamageBonus";
import SpellLink from 'common/SpellLink';

const TRICK_SHOT_MODIFIER = 0.15;

class TrickShot extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  _primaryTargets = [];
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
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.TRICK_SHOT_TALENT.id}>
            <SpellIcon id={SPELLS.TRICK_SHOT_TALENT.id} noLink /> Trick Shot ST
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {(this.owner.formatItemDamageDone(this.bonusDmg))}
        </div>
      </div>
    );
  }

}

export default TrickShot;
