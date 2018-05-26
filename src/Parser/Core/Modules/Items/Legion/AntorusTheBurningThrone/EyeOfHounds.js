import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import ItemLink from 'common/ItemLink';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatPercentage } from 'common/format';
import { calculatePrimaryStat, calculateSecondaryStatDefault } from 'common/stats';
import Abilities from 'Parser/Core/Modules/Abilities';

/**
 * Eye of Shatug / Eye of F'harg
 * Use: swaps between both versions
 * initial state is in the trinkets bonusID (3618 for the stamina one, 3619 for the armor one)
*/

const STAMINA_EYE_BONUS_ID = 3618;

class EyeOfHounds extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
  };

  isCurrentlyStamina = true;
  lastCheck = 0;
  
  stamStat = 0;
  versStat = 0;

  strStat = 0;
  armorStat = 0;


  stamUptime = 0;
  strUptime = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.EYE_OF_HOUNDS.id);
    if (this.active) {
      const iLvl = this.combatants.selected.getItem(ITEMS.EYE_OF_HOUNDS.id).itemLevel;
      const bonusIDs = Object.values(this.combatants.selected.gear).filter(item => item.id === ITEMS.EYE_OF_HOUNDS.id)[0].bonusIDs;
      
      this.isCurrentlyStamina = bonusIDs.includes(STAMINA_EYE_BONUS_ID);

      this.stamStat = calculatePrimaryStat(930, 4093, iLvl);
      this.versStat = calculateSecondaryStatDefault(930, 1320, iLvl);

      this.strStat = calculatePrimaryStat(930, 2728, iLvl);
      this.armorStat = calculateSecondaryStatDefault(930, 1011, iLvl);

      this.lastCheck = this.owner.fight.start_time;
    }  
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.SWAP_HOUNDS.id) {
      return;
    }

    if (this.isCurrentlyStamina) {
      this.stamUptime += event.timestamp - this.lastCheck;
    } else {
      this.strUptime += event.timestamp - this.lastCheck;
    }

    this.lastCheck = event.timestamp;
    this.isCurrentlyStamina = !this.isCurrentlyStamina;
  }

  get staminaUptime() {
    //add uptime if stamina-version is active
    if (this.isCurrentlyStamina) {
      this.stamUptime += this.owner.currentTimestamp - this.lastCheck;
      this.lastCheck = this.owner.currentTimestamp;
    }

    return this.stamUptime / (this.owner.currentTimestamp - this.owner.fight.start_time);
  }

  get strengthUptime() {
    //add uptime if strength-version is active
    if (!this.isCurrentlyStamina) {
      this.strUptime += this.owner.currentTimestamp- this.lastCheck;
      this.lastCheck = this.owner.currentTimestamp;
    }

    return this.strUptime / (this.owner.currentTimestamp - this.owner.fight.start_time);
  }

  get averageStats() {
    const itemBreakdown = [];
    const stam = this.staminaUptime;
    const str = this.strengthUptime;

    if (stam) {
      itemBreakdown.push(
        <div>
          <ItemLink id={ITEMS.EYE_OF_SHATUG.id} /><br />
          <dfn data-tip={`${formatPercentage(stam)}% uptime, resulting in those shown average stats.`}>
            {(stam * this.stamStat).toFixed(0)} Stamina<br />
            {(stam * this.versStat).toFixed(0)} Versatility
          </dfn>
        </div>
      );
    }

    if (str) {
      itemBreakdown.push(
        <div>
          <ItemLink id={ITEMS.EYE_OF_FHARG.id} /><br />
          <dfn data-tip={`${formatPercentage(str)}% uptime, resulting in those shown average stats.`}>
            {(str * this.strStat).toFixed(0)} {this.combatants.selected.spec.primaryStat}<br />
            {(str * this.armorStat).toFixed(0)} Armor
          </dfn>
        </div>
      );
    }

    return itemBreakdown;
  }

  item() {
    return {
      item: ITEMS.EYE_OF_HOUNDS,
      result: (
        <React.Fragment>
          {this.averageStats}
        </React.Fragment>
      ),
    };
  }
}

export default EyeOfHounds;
