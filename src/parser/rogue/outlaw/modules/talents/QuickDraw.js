import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import { formatNumber } from 'common/format';

const BASE_CP_GENERATED = 1;
const DAMAGE_INCREASE = 0.5;

class QuickDraw extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.QUICK_DRAW_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.PISTOL_SHOT), this._onPistolShotEnergize);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PISTOL_SHOT), this._onPistolShotDamage);
  }

  damageGained = 0;
  procs = 0;
  comboPointsWasted = 0;

  _onPistolShotEnergize(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.OPPORTUNITY.id)) {
      return;
    }
    const cpGeneratedByBroadside = this.selectedCombatant.hasBuff(SPELLS.BROADSIDE.id) ? 1 : 0;
    const cpForEvent = (event.resourceChange || 0) + (event.waste || 0) - cpGeneratedByBroadside - BASE_CP_GENERATED;
    this.procs += cpForEvent > 0 ? 1 : 0;
    if(cpForEvent>0 && event.waste>0){
        this.comboPointsWasted+=1;
    }
    if(cpForEvent>0){
      console.log(event);
    }
  }

  _onPistolShotDamage(event) {
    this.damageGained += calculateEffectiveDamage(event, DAMAGE_INCREASE) || 0;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.QUICK_DRAW_TALENT.id}
        value={<>${this.procs} procs</>}
        label={<>Quick Draw procs did ${formatNumber(this.damageGained)} extra damage and generated ${this.procs} Combopoints.</>}
      />
    );
  }
}

export default QuickDraw;
