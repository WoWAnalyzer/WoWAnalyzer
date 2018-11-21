import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import HIT_TYPES from 'game/HIT_TYPES';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import SpellIcon from 'common/SpellIcon';

/**
 * Wild Call has a 20% increased chance to reset the cooldown of Barbed Shot.
 *
 * Example log: https://www.warcraftlogs.com/reports/PLyFT2hcmCv39X7R#fight=1&type=damage-done&source=6
 *
 * Wild Call: Your auto shot critical strikes have a 20% chance to reset the cooldown of Barbed Shot.
 */

const WILD_CALL_RESET_PERCENT = 0.2;

class OneWithThePack extends Analyzer {

  procChances = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ONE_WITH_THE_PACK_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AUTO_SHOT.id) {
      return;
    }
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    this.procChances += 1;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.ONE_WITH_THE_PACK_TALENT.id}
        value={`≈${(this.procChances * WILD_CALL_RESET_PERCENT).toFixed(1)} resets`}
        tooltip={`Since there is no way to track Wild Call resets, this is an approximation of how many resets One With The Pack granted you.`}
      />
    );
  }
}

export default OneWithThePack;
