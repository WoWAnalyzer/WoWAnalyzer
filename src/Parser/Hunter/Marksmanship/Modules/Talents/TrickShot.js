import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from 'Main/StatisticBox';
import getDamageBonus from "Parser/Hunter/Shared/Modules/getDamageBonus";
import { formatNumber, formatPercentage } from "common/format";

const TRICK_SHOT_MODIFIER = 0.15;

class TrickShot extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  _primaryTargets = [];
  bonusDmg = 0;
  bonusCleaveDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.TRICK_SHOT_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    this._primaryTargets.push({
      timestamp: event.timestamp,
      targetID: event.targetID,
      targetInstance: event.targetInstance,
    });
  }

  // TODO: Find a good way tracking Trick Shot cleave damage
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    const primaryTargetEventIndex = this._primaryTargets.findIndex(primary => primary.targetID === event.targetID && primary.targetInstance === event.targetInstance);
    console.log(primaryTargetEventIndex);
    if (primaryTargetEventIndex === -1) {
      this.bonusCleaveDmg += event.amount;
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.TRICK_SHOT_BUFF.id)) {
      console.log("hey");
      this.bonusDmg += getDamageBonus(event, TRICK_SHOT_MODIFIER);
    }
  }

  statistic() {
    const totalBonusDamage = this.bonusCleaveDmg + this.bonusDmg;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TRICK_SHOT_TALENT.id} />}
        value={`${formatNumber(this.bonusDmg + this.bonusCleaveDmg)}`}
        label={this.owner.formatItemDamageDone(totalBonusDamage)}
        tooltip={`Trick Shot contributed with this much extra damage over the course of the encounter. Below, you'll see them split in single-target and cleave: <ul>
<li>Single-target: ${this.owner.formatItemDamageDone(this.bonusDmg)}. (${formatPercentage(this.bonusDmg / totalBonusDamage)}% of total contribution)</li>
<li>Cleave: ${this.owner.formatItemDamageDone(this.bonusCleaveDmg)}. (${formatPercentage(this.bonusCleaveDmg / totalBonusDamage)}% of total contribution)</li>
</li></ul>`}
      />
    );
  }

}

export default TrickShot;
