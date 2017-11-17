import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from 'Main/StatisticBox';
import getDamageBonus from "Parser/Hunter/Shared/Modules/getDamageBonus";
import { formatNumber } from "common/format";

const TRICK_SHOT_MODIFIER = 0.15;

class TrickShot extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;
  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.TRICK_SHOT_TALENT.id);
  }

  // TODO: Find a good way tracking Trick Shot cleave damage
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    if (!this.combatants.selected.hasBuff(SPELLS.TRICK_SHOT_BUFF.id)) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, TRICK_SHOT_MODIFIER);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TRICK_SHOT_TALENT.id} />}
        value={`${formatNumber(this.bonusDmg)}`}
        label={this.owner.formatItemDamageDone(this.bonusDmg)}
        tooltip={`Trick Shot contributed with this much extra damage over the course of the fight on Single-Target.`}
      />
    );
  }

}

export default TrickShot;
