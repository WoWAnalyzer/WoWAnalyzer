import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import ItemLink from 'common/ItemLink';
import Analyzer from 'Parser/Core/Analyzer';
import Wrapper from 'common/Wrapper';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatPercentage } from 'common/format';
import { calculatePrimaryStat, calculateSecondaryStatDefault } from 'common/stats';
import Abilities from 'Parser/Core/Modules/Abilities';

/**
 * Eye of Shatug / Eye of F'harg
 * Use: swaps between both versions
 * initial state is in the trinkets bonusID (3618 for the stamina one, 3619 for the armor one)
*/

const VERS_EYE = 3618;  // state = 0
const ARMOR_EYE = 3619; // state = 1

class DiimasGlacialAegis extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
  };

  isCurrentlyVers = true;
  lastSwap = 0;
  
  stam_stat = 0;
  vers_stat = 0;

  str_stat = 0;
  armor_stat = 0;

  stam_uptime = 0;
  str_uptime = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.EYE_OF_HOUNDS.id);
    if (this.active) {
      const iLvl = this.combatants.selected.getItem(ITEMS.EYE_OF_HOUNDS.id).itemLevel;
      const bonusIDs = Object.values(this.combatants.selected.gear).filter(item => item.id === ITEMS.EYE_OF_HOUNDS.id)[0].bonusIDs;
      
      if (bonusIDs.includes(ARMOR_EYE)) {
        this.isCurrentlyVers = false;
      }

      this.stam_stat = calculatePrimaryStat(930, 4093, iLvl);
      this.vers_stat = calculateSecondaryStatDefault(930, 1320, iLvl);

      this.str_stat = calculatePrimaryStat(930, 2728, iLvl);
      this.armor_stat = calculateSecondaryStatDefault(930, 1011, iLvl);

      this.lastSwap = this.owner.fight.start_time;
    }  
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.SWAP_HOUNDS.id) {
      return;
    }

    if (this.isCurrentlyVers) {
      this.stam_uptime += (event.timestamp - this.lastSwap);
    } else {
      this.str_uptime += (event.timestamp - this.lastSwap);
    }

    this.lastSwap = event.timestamp;
    this.isCurrentlyVers = !this.isCurrentlyVers;
  }

  on_finished(event) {
    if (this.isCurrentlyVers) {
      this.stam_uptime += (this.owner.fight.end_time - this.lastSwap);
    } else {
      this.str_uptime += (this.owner.fight.end_time - this.lastSwap);
    }
  }

  get averageStats() {
    
    const stam_uptime = this.stam_uptime / this.owner.fightDuration;
    const str_uptime = this.str_uptime / this.owner.fightDuration;
    const itemBreakdown = [];

    if (stam_uptime !== 0) {
      itemBreakdown.push(
        <div>
          <ItemLink id={ITEMS.EYE_OF_SHATUG.id} /><br/>
          <dfn data-tip={`${formatPercentage(stam_uptime)}% uptime, resulting in those shown average stats.`}>
            {(stam_uptime * this.stam_stat).toFixed(0)} Stamina<br/>
            {(stam_uptime * this.vers_stat).toFixed(0)} Versatility
          </dfn>
        </div>
      );
    }

    if (str_uptime !== 0) {
      itemBreakdown.push(
        <div>
          <ItemLink id={ITEMS.EYE_OF_FHARG.id} /><br/>
          <dfn data-tip={`${formatPercentage(str_uptime)}% uptime, resulting in those shown average stats.`}>
            {(str_uptime * this.str_stat).toFixed(0)} {this.combatants.selected.spec.primaryStat}<br/>
            {(str_uptime * this.armor_stat).toFixed(0)} Armor
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
        <Wrapper>
          {this.averageStats}
        </Wrapper>
      ),
    };
  }
}

export default DiimasGlacialAegis;
