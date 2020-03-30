import React from 'react';

import SPELLS from 'common/SPELLS';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemHealingDone from 'interface/ItemHealingDone';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatNumber } from 'common/format';

const debug = false;
//https://www.warcraftlogs.com/reports/9jk4czd6TxGf3bqh#fight=1&type=summary&source=30

class VisionsOfPerfection extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  ignore = false;
  lastCast = 0;
  channelTime = 0;

  directHealing = 0;
  directOverheal = 0;

  hotHealing = 0;
  hotOverhealing = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.VISION_OF_PERFECTION.traitId);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TRANQUILITY_CAST), this.flipFlop);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TRANQUILITY_HEAL), this.flipFlop);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.TRANQUILITY_HEAL), this.countHealing);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.TRANQUILITY_HEAL), this.startListening);
    this.addEventListener(Events.fightend, this.end);
  }

  flipFlop(event){
    this.ignore = true;
    this.lastCast = event.timestamp;
    if(this.lastCast + this.channelTime <= event.timestamp){
      this.channelTime = (8 / (1 + this.statTracker.hastePercentage(this.statTracker.currentHasteRating))) * 1000;
      this.channelTime = this.channelTime / 5;
      this.channelTime *= 1.05;
    }
  }

  countHealing(event){
    if(!event.tick && (this.lastCast + this.channelTime <= event.timestamp)){//proc
      this.ignore = false;//if the hot exists
      this.directHealing += event.amount || 0;
      this.directOverheal += event.overheal || 0;
    }

    if(event.tick && !this.ignore){
      this.hotHealing += event.amount || 0;
      this.hotOverhealing += event.overheal || 0;
    }
  }

  startListening(event){
    this.ignore = false;
  }

  end(event){
    if(debug){
      console.log("direct healing: " + this.directHealing);
      console.log("direct overhealing: " + this.directOverheal);
      console.log("Total Healing" + this.totalHealing);
      console.log("hot healing: " + this.hotHealing);
      console.log("hot overhealing: " + this.hotOverhealing);
      console.log("Total overhealing: " + this.totalOverhealing);
    }
  }

  get totalHealing(){
    return this.directHealing + this.hotHealing;
  }

  get totalOverhealing(){
    return this.directOverheal + this.hotOverhealing;
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="flexible"
        tooltip={(
          <>
            Direct healing: {formatNumber(this.directHealing)} ({formatNumber(this.directOverheal)})<br />
            Hot healing: {formatNumber(this.hotHealing)}({formatNumber(this.hotOverhealing)})
          </>
        )}
      >
        <BoringSpellValueText
          spell={SPELLS.VISION_OF_PERFECTION}
        >
        <ItemHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }

}

export default VisionsOfPerfection;
