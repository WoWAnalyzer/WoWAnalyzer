import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatNumber, formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import ItemHealingDone from 'interface/others/ItemHealingDone';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import StatisticGroup from 'interface/statistics/StatisticGroup';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';

import { calculateAzeriteEffects } from 'common/stats';

const debug = false;

const OVERHEAL_ABSORB_RATE = 0.15;
const RANK_TWO_HEALING_BOOST = 1.5;

// Live Report with multiple Rank 1 fights/uses 
//   https://www.warcraftlogs.com/reports/ADH6NnKYPGxtf318#boss=-2&difficulty=0&type=healing&ability=296197
//   Grong 4 uses 
//     https://www.warcraftlogs.com/reports/ADH6NnKYPGxtf318#type=healing&fight=9&source=14
//   Conclave 5 uses 
//     https://www.warcraftlogs.com/reports/ADH6NnKYPGxtf318#type=healing&fight=22&source=14
// Live Rank 1 Grong 2 Uses 
//   https://www.warcraftlogs.com/reports/HKnChBYqyXk61g3V/#fight=8&type=healing&source=23
// PTR rank 3 Orgozoa 0 uses 
//   https://www.warcraftlogs.com/reports/wg7GpmZxhat6TLjV/#fight=41&source=3
class TheWellOfExistence extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  majorHealing = 0;
  minorHealing = 0;
  totalAbsorbedOverhealing = 0;
  currentAbsorbedOverhealing = 0;
  rankThreeDoubledOverhealing = 0;
  rankThreeDoubleCap = 0
  maxHp = 0;
  // for debug 
  wellFullMissedOverhealing = 0;
  totalOverhealing = 0;
  
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.WELL_OF_EXISTENCE.traitId);
    if (!this.active) {
      return;
    }
    this.hasMajor = this.selectedCombatant.hasMajor(SPELLS.WELL_OF_EXISTENCE.traitId);
    this.rankThreeOrAbove = this.selectedCombatant.essenceRank(SPELLS.WELL_OF_EXISTENCE.traitId) >= 3;
    if(this.rankThreeOrAbove){
        this.rankThreeDoubleCap = calculateAzeriteEffects(SPELLS.WELL_OF_EXISTENCE_DOUBLE_ABSORBTION.id, this.selectedCombatant.neck.itemLevel)[0];
    }
    
    if(this.hasMajor){
      this.abilities.add({
       spell: SPELLS.WELL_OF_EXISTENCE_MAJOR_ABILITY,
       category: Abilities.SPELL_CATEGORIES.ITEMS,
       cooldown: 15,
     });
    }
    
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this._onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this._onCast);
    debug && this.addEventListener(Events.fightend, this._fightend);
  }

  _onHeal(event) {
    // Essence passive heal 
    if(SPELLS.WELL_OF_EXISTENCE_HEAL.id === event.ability.guid){
      this.minorHealing += event.amount;
      this.currentAbsorbedOverhealing -= event.amount;
    } else if(SPELLS.WELL_OF_EXISTENCE_MAJOR_ABILITY.id === event.ability.guid) { //essence major heal`
      this.majorHealing += event.amount;

      if(this.rankThreeOrAbove){
        // Rank 3 doesnt dump the well, only as much as needed (don't need to consider overheal)
        // Healing is amplified, so you lost (heal divided by amplification) from the well
        this.currentAbsorbedOverhealing -= event.amount / RANK_TWO_HEALING_BOOST;
      } else{
        // Under rank 3 you lose all stored healing on active 
        this.currentAbsorbedOverhealing = 0;
      }
    } else if(event.overheal){ // anything else that overhealed
      if(debug){
        this.totalOverhealing += event.overheal;
      }        
        
      let absorbableOverhealing = event.overheal * OVERHEAL_ABSORB_RATE;
        
      // early out if well already full      
      if(this.currentAbsorbedOverhealing >= this.maxHp){
        if(debug){
          this.wellFullMissedOverhealing += absorbableOverhealing;
        }
        return;
      }
      
      // if absorb will put over cap
      if(this.currentAbsorbedOverhealing + absorbableOverhealing > this.maxHp){
        const asorbableUnderCap = this.maxHp - this.currentAbsorbedOverhealing;
        if(debug){
          this.wellFullMissedOverhealing += absorbableOverhealing - asorbableUnderCap;
        }
        absorbableOverhealing = asorbableUnderCap;
      }
      
      // If overheal can be doubled and below threshold to do it
      if(this.rankThreeOrAbove && this.currentAbsorbedOverhealing < this.rankThreeDoubleCap){
        const doubledOverhealing = 2 * absorbableOverhealing;
        // If all overheal is below the threshold
        if(this.currentAbsorbedOverhealing + doubledOverhealing < this.rankThreeDoubleCap){
          this.rankThreeDoubledOverhealing += absorbableOverhealing;
          this.currentAbsorbedOverhealing += doubledOverhealing;
        } else{ // If only part of overheal is below the threshold
          const remainingDoubleableOverhealing = this.rankThreeDoubleCap - this.currentAbsorbedOverhealing;
          this.rankThreeDoubledOverhealing += remainingDoubleableOverhealing;
          const totalAbsorbed = (2 * remainingDoubleableOverhealing) + (absorbableOverhealing - remainingDoubleableOverhealing);
          this.currentAbsorbedOverhealing += totalAbsorbed;
        }
      } else{
        this.currentAbsorbedOverhealing += absorbableOverhealing;
      }
      
      this.totalAbsorbedOverhealing += absorbableOverhealing;
    }
  }
  
  _onCast(event) {
    // This isn't perfect, but will keep max hp roughly 
    // correct as it may change during fight
    this.maxHp = event.maxHitPoints;
  } 
  
  // This function is only connected in debug
  _fightend() {
    console.log('Total Overhealing: ' + this.totalOverhealing);
    const expectedOverhealing = this.totalOverhealing * OVERHEAL_ABSORB_RATE;
    console.log('Total Absorbed Overhealing Expected : ' + expectedOverhealing + '. Reported: ' + this.totalAbsorbedOverhealing);
    console.log('Absorbable Overhealing missed from full well: ' + this.wellFullMissedOverhealing);
  }

  statistic() {
    const rank = this.selectedCombatant.essenceRank(SPELLS.WELL_OF_EXISTENCE.traitId);
    return (
      <StatisticGroup category={STATISTIC_CATEGORY.ITEMS}>
        <ItemStatistic 
          ultrawide
          size="flexible">
          <div className="pad">
            <label><SpellLink id={SPELLS.WELL_OF_EXISTENCE.id} /> - Minor Rank {rank}</label>
            <div className="value">
              <ItemHealingDone amount={this.minorHealing} /><br />
              {formatNumber(this.totalAbsorbedOverhealing)} <small>overheal absorbed</small><br />
              {this.rankThreeOrAbove && (<>{formatPercentage(this.rankThreeDoubledOverhealing / this.totalAbsorbedOverhealing)}% <small>overheal absorption doubled</small><br /></>)}
            </div>
          </div>
        </ItemStatistic>
        {this.hasMajor && (
          <ItemStatistic
            ultrawide
            size="flexible">
            <div className="pad">
              <label><SpellLink id={SPELLS.WELL_OF_EXISTENCE_MAJOR.id} /> - Major Rank {rank}</label>
              <div className="value">
                <ItemHealingDone amount={this.majorHealing} /><br />
              </div>
            </div>
          </ItemStatistic>
        )}
      </StatisticGroup>
    );
  }
}

export default TheWellOfExistence;
