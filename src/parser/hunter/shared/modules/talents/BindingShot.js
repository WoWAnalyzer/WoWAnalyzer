import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import SpellIcon from 'common/SpellIcon';
import React from 'react';

/**
 * Fires a magical projectile, tethering the enemy and any other enemies within 5 yards for 10 sec, rooting them in place for 5 sec if they move more than 5 yards from the arrow.
 */

class BindingShot extends Analyzer {

  _roots = 0;
  _applications = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BINDING_SHOT_TALENT.id);
  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BINDING_SHOT_ROOT.id && spellId !== SPELLS.BINDING_SHOT_TETHER.id) {
      return;
    }
    if (spellId === SPELLS.BINDING_SHOT_ROOT.id) {
      this._roots += 1;
    }
    if (spellId === SPELLS.BINDING_SHOT_TETHER.id) {
      this._applications += 1;
    }
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.BINDING_SHOT_TALENT.id}
        value={`${this._roots} roots / ${this._applications} possible`}
      />
    );
  }
}

export default BindingShot;
