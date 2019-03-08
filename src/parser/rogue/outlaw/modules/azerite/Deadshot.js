//Shneeki's work in progress (aka Playground) please don't publish this if I mistakenly PR on it with this line here!

//Below is taken from HawkCorrigans lavashock.js file as he explains it's similar as a flat damage boosting trait so we should be able to grab most of the basics from here

//This section looks the Outlaw Azerite trait 'Deadshot' which gives a flat damage buff to pistol shot after 'Between the Eyes' has been used.  
//This trait has a 100% chance on cast to provide the damage buff.

import React from 'react';
import SPELLS from 'common/SPELLS'; 
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import StatTracker from 'parser/shared/modules/StatTracker';

const ES_AP_COEFFICIENT = 2.1;  //ES_AP_COEFFICIENT (?)** Need to find An AP coefficient to use.  ?Ravenholdt

class Deadshot extends Analyzer {  
  static dependencies = {
    statTracker: StatTracker,
  };

  procs = 0;
  damageGained = 0;
  traitBonus = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.DEADSHOT.id); 
    if (!this.active) {
      return;
    }
    this.traitBonus = this.selectedCombatant.traitsBySpellId[SPELLS.DEADSHOT.id]  
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.DEADSHOT.id, rank)[0], 0); 
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.PISTOL_SHOT.id) { 
      return;
    }
    const buff = this.selectedCombatant.getBuff(SPELLS.DEADSHOT_BUFF.id);
    if (buff === undefined) {
      return;
    }
    const [bonusDamage] = calculateBonusAzeriteDamage(event, [this.traitBonus], ES_AP_COEFFICIENT, this.statTracker.currentAgilityRating);  
    this.damageGained += (buff.stacks || 0) * bonusDamage;
    this.procs += 1;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.DEADSHOT.id} 
        value={<ItemDamageDone amount={this.damageGained} />}
        tooltip={`Deadshot trait added ${formatNumber(this.damageGained)} damage with ${formatNumber(this.procs)} procs.`} 
      />
    );
  }
}

export default Deadshot;  
