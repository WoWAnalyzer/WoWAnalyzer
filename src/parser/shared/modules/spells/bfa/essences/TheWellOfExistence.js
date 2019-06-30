import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatNumber, formatDuration } from 'common/format';
import SpellLink from 'common/SpellLink';

import ItemHealingDone from 'interface/others/ItemHealingDone';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import StatisticGroup from 'interface/statistics/StatisticGroup';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';

//https://www.warcraftlogs.com/reports/wg7GpmZxhat6TLjV#fight=41&source=44
class TheWellOfExistence extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  
  majorHealing = 0;
  minorHealing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.WELL_OF_EXISTENCE.traitId);
    if (!this.active) {
      return;
    }
    this.hasMajor = this.selectedCombatant.hasMajor(SPELLS.WELL_OF_EXISTENCE.traitId);

    if(this.hasMajor){
      this.abilities.add({
       spell: SPELLS.WELL_OF_EXISTENCE_MAJOR_ABILITY,
       category: Abilities.SPELL_CATEGORIES.ITEMS,
       cooldown: 15,
     });
    }
    
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this._onHeal);
  }

  numMajorCasts = 0;
  majorCasts = {};
  _onHeal(event) {
    if(SPELLS.WELL_OF_EXISTENCE_HEAL.id === event.ability.guid)
    {
      this.minorHealing += event.amount;
    }
    else if(SPELLS.WELL_OF_EXISTENCE_MAJOR_ABILITY.id === event.ability.guid) {
      this.majorHealing += event.amount;
      this.numMajorCasts += 1;
      this.majorCasts[this.numMajorCasts] = {
        timestamp: event.timestamp,
        healing: event.amount,
      }; 
    } 
  }

  statistic() {
    const nth = (number) => number + (["st", "nd", "rd"][((number + 90) % 100 - 10) % 10 - 1] || "th");
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
            </div>
          </div>
        </ItemStatistic>
        {this.hasMajor && (
          <ItemStatistic
            ultrawide
            size="flexible"
            dropdown={(
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <th>Cast</th>
                    <th>Time</th>
                    <th>Healing</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    Object.values(this.majorCasts).map((cast, index) => {
                      return (
                        <tr key={index}>
                          <th>{nth(index + 1)}</th>
                          <td>{formatDuration((cast.timestamp - this.owner.fight.start_time) / 1000) || 0}</td>
                          <td>{formatNumber(cast.healing)}</td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            )}>
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
