import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Combatants from 'parser/shared/modules/Combatants';

import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import ItemHealingDone from 'interface/ItemHealingDone';

import { LIFE_COCOON_HEALING_BOOST } from '../../constants';

class LifeCocoon extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  healing: number = 0;

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.heal, this.cocoonBuff);
  }

  cocoonBuff(event: HealEvent) {
    //Life Cocoon works on any HoT that has this flag checked even if they don't come from the mistweaver themselves
    if(!event.tick){
      return;
    }

    const target = this.combatants.players[event.targetID];

    if(!target){
      return;
    }

    if(target.hasBuff(SPELLS.LIFE_COCOON.id, event.timestamp, 0, 0)){
      this.healing += calculateEffectiveHealing(event, LIFE_COCOON_HEALING_BOOST);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        tooltip={<>Life Cocoon boosts HoTs from other players as wells as your own.</>}
      >
        <BoringSpellValueText spell={SPELLS.LIFE_COCOON}>
          <ItemHealingDone amount={this.healing} /><br />
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default LifeCocoon;
