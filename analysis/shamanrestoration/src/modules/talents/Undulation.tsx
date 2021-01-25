import React from 'react';

import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import Events, { HealEvent } from 'parser/core/Events';

const UNDULATION_HEALING_INCREASE = 0.5;
const BUFFER_MS = 300;

class Undulation extends Analyzer {
  healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.UNDULATION_TALENT.id);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell([SPELLS.HEALING_WAVE, SPELLS.HEALING_SURGE]), this._onHeal);
  }
  // TODO this might need to account for pwave covenant ability in SL as it copies healing waves
  _onHeal(event: HealEvent) {
    const hasUndulation = this.selectedCombatant.hasBuff(SPELLS.UNDULATION_BUFF.id, event.timestamp, BUFFER_MS, BUFFER_MS);

    if (hasUndulation) {
      this.healing += calculateEffectiveHealing(event, UNDULATION_HEALING_INCREASE);
    }
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.UNDULATION_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }

}

export default Undulation;
