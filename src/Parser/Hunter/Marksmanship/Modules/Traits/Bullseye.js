import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import { formatNumber, formatPercentage } from "common/format";
import CooldownTracker from '../Features/CooldownTracker';

class Bullseye extends Analyzer{
  executeTimestamp;
  bullseyeResets = 0; //only resets when boss < 20% health, so resets we can confirm shouldn't have happened
  bullseyeInstances = [];
  saveForExecuteThreshhold;
  bossIDs = [];

  static dependencies = {
    cooldownTracker : CooldownTracker,
  }
  on_initialized(){
    this.owner.report.enemies.forEach(enemy => {
      if (enemy.fights[0].id === this.owner.fight.id && enemy.type === "Boss"){ //ensure that we only count Bosses for checking if bullseye was reset during execute
        this.bossIDs.push(enemy.id);
      }
    });
  }
  on_byPlayer_applybuff(event){
    if (event.ability.guid !== SPELLS.BULLSEYE_TRAIT.id){
      return;
    }
    this.bullseyeInstances.push({'start':event.timestamp - this.owner.fight.start_time});
  }

  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid !== SPELLS.BULLSEYE_TRAIT.id){
      return;
    }
    if (event.stack === 30){
      this.bullseyeInstances[this.bullseyeInstances.length-1].maxStacksTimestamp = event.timestamp - this.owner.fight.start_time;
    }
  }

  on_byPlayer_removebuff(event){
    if (event.ability.guid !== SPELLS.BULLSEYE_TRAIT.id){
      return;
    }
    if (this.executeTimestamp){
      this.bullseyeResets ++;
      this.bullseyeInstances[this.bullseyeInstances.length-1].duringExecute = true;
    }
    this.bullseyeInstances[this.bullseyeInstances.length-1].end = event.timestamp - this.owner.fight.start_time;
  }

  on_byPlayer_damage(event){
    if(event.targetInstance === undefined && event.maxHitPoints && this.bossIDs.indexOf(event.targetID) !== -1){
      if ((event.hitPoints / event.maxHitPoints * 10000)/100 <= 20 && !this.executeTimestamp){
        this.executeTimestamp = event.timestamp - this.owner.fight.start_time;
      }
      if ((event.hitPoints / event.maxHitPoints * 10000)/100 <= 25 && !this.saveForExecuteThreshhold){ //this is unused here, but will be used in the crows module
        this.saveForExecuteThreshhold = event.timestamp - this.owner.fight.start_time; //generally accepted rule is to save crows if boss is below 25% health. I won't calculate whether one "could have" used crows because it's not super applicable unless fight time doesn't change at all
      }
    }
  }

  statistic() {
    if (!this.bullseyeInstances[0]){
      return;
    }
    if (this.bullseyeInstances[this.bullseyeInstances.length-1] && !this.bullseyeInstances[this.bullseyeInstances.length-1].end){
      this.bullseyeInstances[this.bullseyeInstances.length-1].end = this.owner.fight.end_time - this.owner.fight.start_time;
    }
    this.bullseyeUptime = 0;
    this.bullseyeMaxUptime = 0;
    this.bullseyeInstances.forEach(instance => {
      this.bullseyeUptime += instance.end - instance.start;
      if (instance.maxStacksTimestamp){
        this.bullseyeMaxUptime += instance.end - instance.maxStacksTimestamp;
      }
    });
    this.percentBullseyeAtMax = formatPercentage(this.bullseyeMaxUptime / this.bullseyeUptime);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BULLSEYE_TRAIT.id} />}
        value={`${this.percentBullseyeAtMax} %`}
        label="% of bullseye at 30 stacks"
        tooltip={`You reset Bullseye ${this.bullseyeResets} times during the execute phase (boss below 20% health). <br /> You had ${formatNumber(this.bullseyeUptime/1000)} seconds of Bullseye uptime during the fight, and ${formatNumber(this.bullseyeMaxUptime/1000)} seconds of uptime at 30 stacks.`}
      />
    );  
  }

  suggestions(when) {

    when(this.bullseyeResets).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> You reset your bullseye stacks while the boss was below 20% health. Try and avoid this as it is a significant DPS loss. Make sure you're constantly refreshing and adding to your bullseye stacks on targets below 20% hp.</span>)
          .icon('ability_hunter_focusedaim')
          .actual(`${this.bullseyeResets} resets`)
          .recommended(`<1 reset is recommended`)
          .major(recommended);
      });

  }
}
export default Bullseye;