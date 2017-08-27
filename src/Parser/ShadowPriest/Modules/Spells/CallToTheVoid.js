// import React from 'react';

import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';
import PETS from 'common/PETS';

import Pets from '../Core/Pets';

// import Icon from 'common/Icon';
// import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

// import { formatThousands, formatNumber } from 'common/format';

const INSANITY_GENERATED_EACH_TICK = 3;

class CallToTheVoid extends Module {
  static dependencies = {
    pets: Pets,
  };

  _damageDone = 0;
  _generatedInsanity = 0;

  _tentacles = {};

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.traitsBySpellId[SPELLS.CALL_TO_THE_VOID_TRAIT.id];
      this._sourceId  = this.pets.fetchPet(PETS.VOID_TENDRIL).id;
    }
  }

  on_event(eventType, event){
    if(eventType === 'damage' && event.sourceID === this._sourceId && this._sourceId !== undefined){
      this._damageDone += event.amount;
      this._generatedInsanity += INSANITY_GENERATED_EACH_TICK;
    }
  }

  get damageDone(){
    return this._damageDone;
  }

  get insanityGenerated(){
    return this._generatedInsanity;
  }

  get insanityGeneratedPerSecond(){
    return this.insanityGenerated / (this.owner.fightDuration / 1000);
  }

  // unnecessary stat probably:
  // statistic(){
  //   return null;
  //   return (<StatisticBox
  //     icon={<Icon icon={SPELLS.CALL_TO_THE_VOID_TRAIT.icon} alt="DPS stats" />}
  //     value={`${formatNumber(this.damageDone / this.owner.fightDuration * 1000)} DPS`}
  //     label={(
  //       <dfn data-tip={`Total damage done from the trait 'Call to the Void' was ${formatThousands(this.damageDone)}.`}>
  //         Damage done
  //       </dfn>
  //     )}
  //   />);
  // }

  // statisticOrder = STATISTIC_ORDER.CORE(8);
}

export default CallToTheVoid;