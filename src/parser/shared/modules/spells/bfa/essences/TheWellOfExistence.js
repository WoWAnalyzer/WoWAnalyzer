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

const debug = false;

// Can these values be queried? 
const OVERHEAL_ABSORB_RATE = 0.15;
const RANK_TWO_HEALING_BOOST = 1.5;
// https://www.wowhead.com/spell=299936/the-well-of-existence
const RANK_THREE_DOUBLE_CAP = 10982;

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
  // for debug 
  totalOverhealing = 0;
    
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.WELL_OF_EXISTENCE.traitId);
    if (!this.active) {
      return;
    }
    this.hasMajor = this.selectedCombatant.hasMajor(SPELLS.WELL_OF_EXISTENCE.traitId);
    this.rankThreeOrAbove = this.selectedCombatant.essenceRank(SPELLS.WELL_OF_EXISTENCE.traitId) >= 3;

    if(this.hasMajor){
      this.abilities.add({
       spell: SPELLS.WELL_OF_EXISTENCE_MAJOR_ABILITY,
       category: Abilities.SPELL_CATEGORIES.ITEMS,
       cooldown: 15,
     });
    }
    
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this._onHeal);
    debug && this.addEventListener(Events.fightend, this._fightend);
  }

  _onHeal(event) {
    // Essence passive heal 
    if(SPELLS.WELL_OF_EXISTENCE_HEAL.id === event.ability.guid)
    {
      this.minorHealing += event.amount;
      this.currentAbsorbedOverhealing -= event.amount;
    }
    // Essence active(major) heal 
    else if(SPELLS.WELL_OF_EXISTENCE_MAJOR_ABILITY.id === event.ability.guid) 
    {
      this.majorHealing += event.amount;

      if(this.rankThreeOrAbove)
      {
        // Rank 3 doesnt dump the well, only as much as needed (don't need to consider overheal)
        // Healing is amplified, so you lost (heal divided by amplification) from the well
        this.currentAbsorbedOverhealing -= event.amount / RANK_TWO_HEALING_BOOST;
      }
      else
      {
        // Under rank 3 you lose all stored healing on active 
        this.currentAbsorbedOverhealing = 0;
      }
    }
    // anything else that overhealed
    else if(event.overheal)
    {
      if(debug)
      {
        this.totalOverhealing += event.overheal;
      }
      
      const absorbableOverhealing = event.overheal * OVERHEAL_ABSORB_RATE;
      // If overheal can be doubled and below threshold to do it
      if(this.rankThreeOrAbove && this.currentAbsorbedOverhealing < RANK_THREE_DOUBLE_CAP)
      {
        const doubledOverhealing = 2 * absorbableOverhealing;
        // If all overheal is below the threshold
        if(this.currentAbsorbedOverhealing + doubledOverhealing < RANK_THREE_DOUBLE_CAP)
        {
          this.rankThreeDoubledOverhealing += absorbableOverhealing;
          this.currentAbsorbedOverhealing += doubledOverhealing;
        }
        // If only part of overheal is below the threshold
        else
        {
          const remainingDoubleableOverhealing = RANK_THREE_DOUBLE_CAP - this.currentAbsorbedOverhealing;
          this.rankThreeDoubledOverhealing += remainingDoubleableOverhealing;
          const totalAbsorbed = (2 * remainingDoubleableOverhealing) + (absorbableOverhealing - remainingDoubleableOverhealing);
          this.currentAbsorbedOverhealing += totalAbsorbed;
        }
      }
      else
      {
        this.currentAbsorbedOverhealing += absorbableOverhealing;
      }
      
      this.totalAbsorbedOverhealing += absorbableOverhealing;
    }
  }
  
  // This function is only connected in debug
  _fightend() {
    console.log('Total Overhealing: ' + this.totalOverhealing);
    const expectedOverhealing = this.totalOverhealing * OVERHEAL_ABSORB_RATE;
    console.log('Total Absorbed Overhealing Expected : ' + expectedOverhealing + '. Reported: ' + this.totalAbsorbedOverhealing);
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
