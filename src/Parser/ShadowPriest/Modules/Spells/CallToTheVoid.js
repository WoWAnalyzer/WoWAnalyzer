// import React from 'react';

import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';

// import Icon from 'common/Icon';
// import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

// import { formatThousands, formatNumber } from 'common/format';

import makeWclUrl from 'common/makeWclUrl';


class CallToTheVoid extends Module {
  _damageDone = 0;
  _generatedInsanity = 0;

  _tentacles = {};

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.traitsBySpellId[SPELLS.CALL_TO_THE_VOID_TRAIT.id];
      this.load();
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

  load() {
    return fetch(makeWclUrl(`report/tables/damage-done/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      sourceid: this.owner.player.id,
    }))
      .then(response => response.json())
      .then((json) => {
        const callOfTheVoids = json.entries.find(entry => entry.guid === SPELLS.CALL_TO_THE_VOID_ENTITY.id);
        if(callOfTheVoids){
          this._damageDone = callOfTheVoids.total;
          if(this.owner.selectedCombatant.traitsBySpellId[SPELLS.LASH_OF_INSANITY_TRAIT.id]){
            this._generatedInsanity = callOfTheVoids.tickCount * 3;
          }
        }
      });
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