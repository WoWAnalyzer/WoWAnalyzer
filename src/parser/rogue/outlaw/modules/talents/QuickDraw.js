import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

const BASE_CP_GENERATED = 1;
const DAMAGE_INCREASE = 0.5;

class QuickDraw extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.QUICK_DRAW_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.PISTOL_SHOT), this._onPistolShot);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PISTOL_SHOT), this._onPistolShot);
  }

  damageGained = 0;
  comboPointsGained = 0;

  _onPistolShot(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.OPPORTUNITY.id)) {
      return;
    }
    this.comboPointsGained +=
      (event.resourceChange > 0 ? event.resourceChange - BASE_CP_GENERATED : 0) || 0;
    this.damageGained += calculateEffectiveDamage(event, DAMAGE_INCREASE) || 0;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.QUICK_DRAW_TALENT.id}
        value={<ItemDamageDone amount={this.damageGained} />} />
    );
  }
}

export default QuickDraw;
