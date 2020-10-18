import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events from 'parser/core/Events';

const debug = false;

class HighNoon extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    statTracker: StatTracker,
  };
  /**
   * HighNoon increases the tick damage from Sunfire so lets track it and
   * see what % of your Sunfire damage it was
   */

  bonusDamage = 0;

  getAbility = spellId => this.abilityTracker.getAbility(spellId);


  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.HIGH_NOON.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SUNFIRE), this.onDamage);
    this.addEventListener(Events.fightend, this.onFightend);
    this.bonus = this.selectedCombatant.traitsBySpellId[SPELLS.HIGH_NOON.id]
      .reduce((total, rank) => {
        const [ damage ] = calculateAzeriteEffects(SPELLS.HIGH_NOON.id, rank);
        debug && this.log(`Rank ${rank}, damage ${damage}`);
        return total + damage;
      }, 0);
  }

  onDamage(event){
      const versPerc = this.statTracker.currentVersatilityPercentage;
      let critMod = 1;

      if(event.hitType === HIT_TYPES.CRIT){
        critMod = 2;
      }

      this.bonusDamage += this.bonus * (1 + versPerc) * critMod;
  }

  onFightend(){
    if(debug){
      console.log("Bonus damage", this.bonusDamage);
      console.log(this.getAbility(SPELLS.SUNFIRE.id).damageEffective);
    }
  }


  statistic() {
    return (
      <AzeritePowerStatistic
        size="flexible"
        tooltip={(
          <>
            Added a total of {formatNumber(this.bonusDamage)} to your Sunfire Dot damage.<br />
          </>
        )}
      >
        <div className="pad">
          <label><SpellLink id={SPELLS.HIGH_NOON.id} /></label>
          <div className="value" style={{ marginTop: 15 }}>
            {formatPercentage(this.bonusDamage / this.getAbility(SPELLS.SUNFIRE.id).damageEffective)}% <small>of Sunfire's Dot Damage</small>
          </div>
        </div>
      </AzeritePowerStatistic>
    );
  }

}

export default HighNoon;
