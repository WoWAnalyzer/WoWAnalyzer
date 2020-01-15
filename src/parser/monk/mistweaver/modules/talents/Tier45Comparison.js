import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';

import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Analyzer from 'parser/core/Analyzer';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';

import ManaTea from './ManaTea';
import SpiritOfTheCrane from './SpiritOfTheCrane';
import Lifecycles from './Lifecycles';


const debug = false;

class Tier45Comparison extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    manaTea: ManaTea,
    manaTracker: ManaTracker,
    spiritOfTheCrane: SpiritOfTheCrane,
    lifeCycles: Lifecycles,
  };

  manatea = {
    selected: false,//is this the selected talent
    manaFrom: 0,//how much mana did they save/get from talent (will compute even if not selected)
    icon: SPELLS.MANA_TEA_TALENT.icon,//icon
    name: SPELLS.MANA_TEA_TALENT.name,//name
    id: SPELLS.MANA_TEA_TALENT.id,//id
    best: false,//is it the best talent
    requiredPerTea: 0,//differs from talent to talent but tldr its the requirements to equal best
  };
  lifecycles = {
    selected: false,
    manaFrom: 0,
    icon: SPELLS.LIFECYCLES_TALENT.icon,
    name: SPELLS.LIFECYCLES_TALENT.name,
    id: SPELLS.LIFECYCLES_TALENT.id,
    best: false,
    requiredVivs: 0,
    requiredEnvs: 0,
  };
  sotc = {
    selected: false,
    manaFrom: 0,
    icon: SPELLS.SPIRIT_OF_THE_CRANE_TALENT.icon,
    name: SPELLS.SPIRIT_OF_THE_CRANE_TALENT.name,
    id: SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id,
    best: false,
    requiredTps: 0,
  };

  talents = [this.manatea, this.lifecycles, this.sotc];

  returnedFromSelected = 0;
  best;

  constructor(...args) {
    super(...args);
    this.sotc.selected = this.selectedCombatant.hasTalent(SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id);
    this.manatea.selected = this.selectedCombatant.hasTalent(SPELLS.MANA_TEA_TALENT.id);
    this.lifecycles.selected = !(this.hasSotc || this.manatea.selected);
  }

  on_fightend() {
    this.totalManaSpent = this.totalManaSpent();
    
    // --- get mana from talents --- //
    if(this.sotc.selected){
      this.sotc.manaFrom = (this.spiritOfTheCrane.manaReturnSotc || 0);
      this.returnedFromSelected = this.sotc.manaFrom;
    }

    if(this.manatea.selected){
      this.manatea.manaFrom = (this.manaTea.manaSavedMT || 0);
      this.returnedFromSelected = this.manatea.manaFrom;
    }

    if(this.lifecycles.selected){
      this.lifecycles.manaFrom = this.lifeCycles.manaSaved;
      this.returnedFromSelected = this.lifecycles.manaFrom;
    }
    // --- end get mana from talents ---//

    // --- setup talents that were not selected --- //
    this.sotc.manaFrom = this.sotc.selected ? this.sotc.manaFrom : this.generateSotc();
    this.manatea.manaFrom = this.manatea.selected ? this.manatea.manaFrom : this.generateManaTea();
    this.lifecycles.manaFrom = this.lifecycles.selected ? this.lifecycles.manaFrom : this.generateLifeCycles();
    // --- end setup talents that were not selected --- //

    // --- pick best --- //
    if(this.sotc.manaFrom > this.manatea.manaFrom && this.sotc.manaFrom > this.lifecycles.manaFrom){
      this.best = this.sotc;
    }
    if(this.manatea.manaFrom > this.sotc.manaFrom && this.manatea.manaFrom > this.lifecycles.manaFrom){
      this.best = this.manatea;
    }
    if(this.lifecycles.manaFrom > this.manatea.manaFrom && this.lifecycles.manaFrom > this.sotc.manaFrom){
      this.best = this.lifecycles;
    }
    if(!this.best){
      this.best = this.manatea;
    }
    // --- end picking best --- //
    
    // -- sees what it takes for the other ones to equal the best -- //
    this.calculateOthers();

    // -- logging for debug --//
    if(debug){
      console.log(this.manatea);
      console.log(this.sotc);
      console.log(this.lifecycles);
    }
  }

  calculateOthers(){

    if(this.sotc !== this.best){
      //sotc gives .65% mana per totm stack used so (max mana * .0065) = mana per totm
      //mana from best talent / mana per totom = totm stacks need but gotta round up since you can't have .5 of a totm stack 
      this.sotc.requiredTps = Math.ceil(this.best.manaFrom / (this.manaTracker.maxResource * .0065));
    }

    if(this.lifecycles !== this.best){
      //life cycles reduces mana cost of two spells if you casted the other before hand
      //so best = (x-1) * 3500 * .25 + x * 5200 * .25 = (best + 875) / 2715 = x
      //x-1 since you viv first in all fights
      this.lifecycles.requiredEnvs = Math.ceil((this.best.manaFrom + 875) / 2715);
      this.lifecycles.requiredVivs = this.lifecycles.requiredEnvs-1;
    }

    if(this.manatea !== this.best){
      const fightLength = (this.owner.fight.end_time - this.owner.fight.start_time)/1000;
      const manaTeasPossible = (Math.ceil(fightLength / 90) || 1);
      this.manatea.requiredPerTea = this.best.manaFrom/manaTeasPossible;
    }
  }

  //sotc gives mana back while the other two save mana
  //anaylze current play style and see how much mana they would have gained from this talent
  generateSotc(){
    const sotcBlackOutKicks = this.abilityTracker.getAbility(SPELLS.BLACKOUT_KICK_TOTM.id).damageHits || 0;
    const manaPercentFromSotc = sotcBlackOutKicks * .0065;
    const rawManaFromSotc = manaPercentFromSotc * this.manaTracker.maxResource;
    return rawManaFromSotc || 0;
  } 

  //anaylze current play style and see how much mana they would have saved (so average mana per second / total mt time)
  generateManaTea(){
    const fightLength = (this.owner.fight.end_time - this.owner.fight.start_time)/1000;
    const manaTeasPossible = (Math.ceil(fightLength / 90) || 1);
    const manaPerTwelve = (this.totalManaSpent/fightLength) * 12;//duration of mana Tea
    const manaPerTea = manaTeasPossible * manaPerTwelve;
    return manaPerTea || 0;
  }

  //anaylze current play style and see how much mana they would have saved (so avarage )
  //assume that each env casted has a viv before it and that first viv is not effected
  generateLifeCycles(){
    const envCasts = this.abilityTracker.getAbility(SPELLS.ENVELOPING_MIST.id).casts || 0;
    const vivCasts = this.abilityTracker.getAbility(SPELLS.VIVIFY.id).casts - 1;
    const manaDiscountOnViv = Math.min(vivCasts, envCasts) * SPELLS.VIVIFY.manaCost * SPELLS.LIFECYCLES_VIVIFY_BUFF.manaPercRed;
    const manaDiscountOnEnv = Math.min(vivCasts, envCasts) * SPELLS.ENVELOPING_MIST.manaCost * SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.manaPercRed;
    return (manaDiscountOnEnv + manaDiscountOnViv) || 0;
  }

  totalManaSpent(){
    let manaSpent = 0;
    let lastMana = this.manaTracker.maxResource;
    this.manaTracker.resourceUpdates.forEach(function(event){
      if(event.used !== 0){
        manaSpent += Math.abs(lastMana - event.used);
      }
      lastMana = event.current;
    });
    return manaSpent;
  }

  get suggestionThresholds() {
    return {
      actual: this.best.selected,
      isEqual: false,
      style: 'boolean',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          With your current playstyle you are not using the most effective tier 45 talent. <SpellLink id={this.best.id} /> is better based off of how you played.
        </>,
      )
        .icon(this.best.icon)
        .actual(`${formatNumber(this.returnedFromSelected)} mana returned through ${this.best.name}`)
        .recommended(`${this.best.name} would have returned ${formatNumber(this.best.manaFrom)}`);
    });
  }

  
  statistic() {
    return (
      <TalentStatisticBox
        talent={this.best.id}
        position={STATISTIC_ORDER.CORE(30)}
        value={`${formatNumber(this.best.manaFrom)} Mana from ${this.best.name}`}
        label={`Tier 45 Comparison`}
        tooltip={(
          <>
          <ul>
            <li>LC = Life cycles</li>
            <li>SOTC = Spirit of the Crane</li>
            <li>MT = mana Tea</li>
          </ul>
          </>
        )}
      >
      <div className="pad">
        <div>
          This is an infographic for tier 45 talents to see what is required to equal the best pick for how you played. This also attempts to calculate the other talents based on how you played for the difference row, for the equals row it shows the requirements in general, ignoring how you played.
        </div>
        <table className="table table-condensed">
          <thead>
            <tr>
              <th />
              <th>LC</th>
              <th>SOTC</th>
              <th>MT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Difference</td>
              <td>{formatNumber(this.best.manaFrom - this.lifecycles.manaFrom)}</td>
              <td>{formatNumber(this.best.manaFrom - this.sotc.manaFrom)}</td>
              <td>{formatNumber(this.best.manaFrom - this.manatea.manaFrom)}</td>
            </tr>
            <tr>
              <td>Equal</td>
              <td>
                Viv:{this.lifecycles.requiredVivs}
                <br />
                Env:{this.lifecycles.requiredEnvs}
              </td>
              <td>Totm Stacks {this.sotc.requiredTps}</td>
              <td>Mana {formatNumber(this.manatea.requiredPerTea)} per tea</td>
            </tr>
            </tbody>
         </table>
        </div>
      </TalentStatisticBox>
    );
  }


}

export default Tier45Comparison;
