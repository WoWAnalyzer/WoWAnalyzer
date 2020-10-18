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

class DawningSun extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    statTracker: StatTracker,
  };
  /**
   * Gives you a buff that increases your solar wrath damage by x for 8 seconds
   * lets track how much damage you gained from it
   */

  bonusDamage = 0;

  getAbility = spellId => this.abilityTracker.getAbility(spellId);


  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.DAWNING_SUN.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SOLAR_WRATH_MOONKIN), this.onDamage);
    this.addEventListener(Events.fightend, this.onFightend);
    this.bonus = this.selectedCombatant.traitsBySpellId[SPELLS.DAWNING_SUN.id]
      .reduce((total, rank) => {
        const [ damage ] = calculateAzeriteEffects(SPELLS.DAWNING_SUN.id, rank);
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

      if(this.selectedCombatant.hasBuff(SPELLS.DAWNING_SUN_BUFF.id)){
        this.bonusDamage += this.bonus * (1 + versPerc) * critMod;
      }
  }

  onFightend(){
    if(debug){
      console.log("Bonus damage", this.bonusDamage);
      console.log(this.getAbility(SPELLS.SOLAR_WRATH_MOONKIN.id).damageEffective);
    }
  }


  statistic() {
    return (
      <AzeritePowerStatistic
        size="flexible"
        tooltip={(
          <>
            Added a total of {formatNumber(this.bonusDamage)} to your Solar Wraths.<br />
          </>
        )}
      >
        <div className="pad">
          <label><SpellLink id={SPELLS.DAWNING_SUN.id} /></label>
          <div className="value" style={{ marginTop: 15 }}>
            {formatPercentage(this.bonusDamage / this.getAbility(SPELLS.SOLAR_WRATH_MOONKIN.id).damageEffective)}% <small>of Solar Wrath Damage</small>
          </div>
        </div>
      </AzeritePowerStatistic>
    );
  }

}

export default DawningSun;
