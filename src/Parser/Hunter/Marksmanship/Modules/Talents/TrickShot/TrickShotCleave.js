import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

class TrickShotCleave extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  _primaryTargets = [];
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

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    const primaryTargetEventIndex = this._primaryTargets.findIndex(primary => primary.targetID === event.targetID && primary.targetInstance === event.targetInstance);
    console.log(primaryTargetEventIndex);
    if (primaryTargetEventIndex === -1) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  subStatistic() {
    if (this.bonusCleaveDmg > 0) {
      return (
        <div className="flex">
          <div className="flex-main">
            <SpellLink id={SPELLS.TRICK_SHOT_TALENT.id}>
              <SpellIcon id={SPELLS.TRICK_SHOT_TALENT.id} noLink /> Trick Shot Cleave
            </SpellLink>
          </div>
          <div className="flex-sub text-right">
            {(this.owner.formatItemDamageDone(this.bonusCleaveDmg))}
          </div>
        </div>
      );
    }
  }
}

export default TrickShotCleave;
