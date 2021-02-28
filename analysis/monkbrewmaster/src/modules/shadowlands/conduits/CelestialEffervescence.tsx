import React from 'react';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import STATISTIC_ORDER  from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';

import { CELESTIAL_EFFERVESCENCE_HEALING_INCREASE } from '../../../constants';

/**
 * While under the effects of Celestial Brew, your effects that heal you are increased by x%
 */
export default class CelestialEffervescence extends Analyzer {

  healingIncrease = 0;
  rank: number;

  constructor(options: Options) {
    super(options);

    this.rank = this.selectedCombatant.conduitRankBySpellID(SPELLS.CELESTIAL_EFFERVESCENCE.id);
    if(!this.rank) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.onHeal);
  }

  private onHeal(event: HealEvent) {
    if(this.selectedCombatant.hasBuff(SPELLS.CELESTIAL_BREW.id)){
      this.healingIncrease += calculateEffectiveHealing(event, CELESTIAL_EFFERVESCENCE_HEALING_INCREASE[this.rank]);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}>
        <ConduitSpellText spell={SPELLS.CELESTIAL_EFFERVESCENCE} rank={this.rank}>
          <ItemHealingDone amount={this.healingIncrease} />
        </ConduitSpellText>
      </Statistic>
    );
  }
}
