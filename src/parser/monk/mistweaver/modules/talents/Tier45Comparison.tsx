import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';

import { ThresholdStyle, When } from 'parser/core/ParseResults';

import Statistic from 'interface/statistics/Statistic';
import BoringValueText from 'interface/statistics/components/BoringValueText'
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

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

  protected abilityTracker!: AbilityTracker;
  protected manaTea!: ManaTea;
  protected manaTracker!: ManaTracker;
  protected spiritOfTheCrane!: SpiritOfTheCrane;
  protected lifeCycles!: Lifecycles;

  manatea: BestTalent & {requiredPerTea: number; } = {
    selected: false,//is this the selected talent
    manaFrom: 0,//how much mana did they save/get from talent (will compute even if not selected)
    icon: SPELLS.MANA_TEA_TALENT.icon,//icon
    name: SPELLS.MANA_TEA_TALENT.name,//name
    id: SPELLS.MANA_TEA_TALENT.id,//id
    best: false,//is it the best talent
    requiredPerTea: 0,//differs from talent to talent but tldr its the requirements to equal best
  };
  lifecycles: BestTalent & {requiredVivs: number; requiredEnvs: number} = {
    selected: false,
    manaFrom: 0,
    icon: SPELLS.LIFECYCLES_TALENT.icon,
    name: SPELLS.LIFECYCLES_TALENT.name,
    id: SPELLS.LIFECYCLES_TALENT.id,
    best: false,
    requiredVivs: 0,
    requiredEnvs: 0,
  };
  sotc: BestTalent & {requiredTps: number;} = {
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
  best!: BestTalent;

  constructor(options: Options){
    super(options);
    this.sotc.selected = this.selectedCombatant.hasTalent(SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id);
    this.manatea.selected = this.selectedCombatant.hasTalent(SPELLS.MANA_TEA_TALENT.id);
    this.lifecycles.selected = !(this.sotc.selected || this.manatea.selected);
    this.addEventListener(Events.fightend, this.endFight);

  }

  endFight() {
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
      //so best = (x-1) * VivCost * LifcylesReduction + x * EnvCost * LifcylesReduction = (best + ReducedViv) / ReducedEnv = x
      //x-1 since you viv first in all fights
      this.lifecycles.requiredEnvs = Math.ceil((this.best.manaFrom + SPELLS.VIVIFY.manaCost * SPELLS.LIFECYCLES_VIVIFY_BUFF.manaPercRed) / SPELLS.ENVELOPING_MIST.manaCost * SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.manaPercRed);
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
    const manaPercentFromSotc = sotcBlackOutKicks * SPELLS.SPIRIT_OF_THE_CRANE_BUFF.manaRet;
    const rawManaFromSotc = manaPercentFromSotc * this.manaTracker.maxResource;
    return rawManaFromSotc || 0;
  }

  //anaylze current play style and see how much mana they would have saved (so average mana per second / total mt time)
  generateManaTea(){
    const fightLength = (this.owner.fight.end_time - this.owner.fight.start_time)/1000;
    const manaTeasPossible = (Math.ceil(fightLength / 90) || 1);
    const manaPerDuration = (this.totalManaSpent()/fightLength) * SPELLS.MANA_TEA_TALENT.duration/1000;//duration of mana Tea
    const manaPerTea = manaTeasPossible * manaPerDuration;
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

  totalManaSpent(): number {
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
      style: ThresholdStyle.BOOLEAN,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          With your current playstyle you are not using the most effective tier 45 talent. <SpellLink id={this.best.id} /> is better based off of how you played.
        </>,
      )
        .icon(this.best.icon)
        .actual(`${formatNumber(this.returnedFromSelected)}${i18n._(t('monk.mistweaver.suggestions.tier45Talent.efficiency')` mana returned through `)}${this.best.name}`)
        .recommended(`${this.best.name} would have returned ${formatNumber(this.best.manaFrom)}`));
  }


  statistic() {

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(30)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown = { 
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
        </div>}
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
        <BoringValueText 
          label={<><SpellIcon id={this.best.id} /> Tier 45 Comparison</>}
        >
          <>
          {formatNumber(this.best.manaFrom)} Mana from {this.best.name}
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

interface BestTalent {
  selected: boolean;
  manaFrom: number;
  icon: string;
  name: string;
  id: number;
  best: boolean;
}

export default Tier45Comparison;
