import React from 'react';
import ImportTarnishedSentinelMedallion from 'Parser/Core/Modules/Items/TarnishedSentinelMedallion';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import CooldownTracker from '../Features/CooldownTracker';


class TarnishedSentinelMedallion extends ImportTarnishedSentinelMedallion {

  static dependencies = {
    cooldownTracker : CooldownTracker,
    combatants: Combatants,
  }
 
  medallionEnd = 0;
  medallionUptime = [];
  medallionDuration = 20000;

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (this.damageAbilities.has(spellId) && event.timestamp > this.medallionEnd) {
      this.medallionEnd = event.timestamp + this.medallionDuration;
      this.medallionUptime.push({'start':event.timestamp, 'end': this.medallionEnd});
      this.checkOverlap();
    }
    if (this.damageAbilities.has(spellId)){
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  checkOverlap(){
    this.medallionCasts = 0;
    this.medallionCastsWithTS = 0;
    this.medallionUptime.forEach(cast => {
      this.medallionCasts ++;
      this.cooldownTracker.pastCooldowns.forEach(ts =>{
        let tsEnd; //because sometimes ts.end is undefined if the parser hasn't gotten there yet
        if(!ts.end){
          tsEnd = ts.start + 15000;
        }
        else{
          tsEnd = ts.end;
        }
        if (ts.start > cast.start - 5000 && tsEnd < cast.end + 5000 && ts.spell.id === SPELLS.TRUESHOT.id){ //giving 7.5 (as agreed upon with Putro) seconds of leeway
          this.medallionCastsWithTS ++;
          console.log(ts.start - this.owner.fight.start_time);
        }
      });
    });
  }

  item() {
    return {
      item: ITEMS.TARNISHED_SENTINEL_MEDALLION,
      result: (
        <dfn data-tip={`You cast <b> ${formatNumber(this.medallionCastsWithTS)} out of ${formatNumber(this.medallionCasts)} </b> Medallion casts with trueshot.`}>
        {formatNumber(this.damage)} damage - {this.owner.formatItemDamageDone(this.damage)}
      </dfn>
      ),
    };
  }
}

export default TarnishedSentinelMedallion;
