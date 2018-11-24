import React from 'react';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Analyzer from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import Events from 'parser/core/Events';
import { formatNumber } from 'common/format';

const BONUS = 0.25;
const AFFECTED_SPELLS = [
  SPELLS.FROSTBOLT_DAMAGE,
  SPELLS.ICE_LANCE_DAMAGE,
  SPELLS.FLURRY_DAMAGE,
];

class LonelyWinter extends Analyzer {

  totalDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LONELY_WINTER_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(AFFECTED_SPELLS), this.onAffectedDamage);
  }

  onAffectedDamage(event) {
    this.totalDamage += calculateEffectiveDamage(event, BONUS);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.LONELY_WINTER_TALENT.id}
        value={this.owner.formatItemDamageDone(this.totalDamage)}
        tooltip={`Total damage increase: ${formatNumber(this.totalDamage)}`}
      />
    );
  }

}

export default LonelyWinter;
