import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {HealEvent } from 'parser/core/Events';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Combatants from 'parser/shared/modules/Combatants';

const ENVELOPING_BREATH_INCREASE = .1;

class EnvelopingBreath extends Analyzer {
    static dependencies = {
        combatants: Combatants,
      };

    protected combatants!: Combatants;

    envBIncrease: number = 0;

    constructor(options: Options) {
        super(options);
        this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleEnvelopingBreath);
    }

  handleEnvelopingBreath(event: HealEvent) {
    const targetId = event.targetID;
    const sourceId = event.sourceID;
    
    if (this.combatants.players[targetId]) {
      if (this.combatants.players[targetId].hasBuff(SPELLS.ENVELOPING_BREATH.id, event.timestamp, 0, 0, sourceId)) {
        this.envBIncrease += calculateEffectiveHealing(event, ENVELOPING_BREATH_INCREASE);
      }
    }
  }

  statistic() {
      return (
        <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={<>This is the effective healing contributed by the Enveloping Breath buff.</>}
      >
        <BoringSpellValueText spell={SPELLS.ENVELOPING_BREATH}>
          <>
            {formatNumber(this.envBIncrease)} <small>healing contributed by the buff</small>
          </>
        </BoringSpellValueText>
      </Statistic>
      );
  }


}

export default EnvelopingBreath;