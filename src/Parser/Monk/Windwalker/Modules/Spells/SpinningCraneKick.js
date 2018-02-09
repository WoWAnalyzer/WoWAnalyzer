import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import StatTracker from 'Parser/Core/Modules/StatTracker';

class SpinningCraneKick extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
    statTracker: StatTracker,
  };
  badCasts = 0;
  markoftheCraneTargets = [];
  lastSpinningCraneKickTick = 0;
  spinningCraneKickHits = 0;
  totalMarksDuringHits = 0;
  markoftheCraneStacks = 0;
  spinningCraneKickDuration = 15000;

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    let targetInstance = event.targetInstance;
    if (spellId !== SPELLS.MARK_OF_THE_CRANE.id) {
      return;
    }
    // The event doesn't specify instance on the first target of that type
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const markoftheCraneTarget = {targetID: event.targetID, targetInstance: targetInstance, timestamp: event.timestamp };
    this.markoftheCraneTargets.push(markoftheCraneTarget);
  }

  on_byPlayer_refreshdebuff(event) {
    const spellId = event.ability.guid;
    let targetInstance = event.targetInstance;
    if (spellId !== SPELLS.MARK_OF_THE_CRANE.id) {
      return;
    }
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const markoftheCraneTarget = {targetID: event.targetID, targetInstance: targetInstance, timestamp: event.timestamp };
    let i = 0;
    while (i <= this.markoftheCraneTargets.length - 1) {
      if (this.markoftheCraneTargets[i].targetID === markoftheCraneTarget.targetID && this.markoftheCraneTargets[i].targetInstance === markoftheCraneTarget.targetInstance) {
        this.markoftheCraneTargets[i].timestamp = markoftheCraneTarget.timestamp;
      }
      i++;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SPINNING_CRANE_KICK.id) {
      return;
    }
    this.markoftheCraneStacks = 0;
    let i = 0;
    while (i < this.markoftheCraneTargets.length) {
      // removing expired targets to avoid looking through huge arrays in logs with a lot of targets
      if (event.timestamp - this.markoftheCraneTargets[i].timestamp > 15000) {
        console.log(this.markoftheCraneTargets.splice(i, 1), "Mark Removed");
      }
      else {
        this.markoftheCraneStacks++;
        //console.log(this.markoftheCraneTargets[i], "Mark of the Crane found and counted");       
      }
      i++;
    }
    // TODO: Expand this to also check for targets hit
    if (this.markoftheCraneStacks <= 1) {
      this.badCasts += 1;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid; 
    if (spellId !== SPELLS.SPINNING_CRANE_KICK_DAMAGE.id) {
      return;
    }
    this.spinningCraneKickDuration = 1500 / (1 + this.statTracker.hastePercentage(this.statTracker.currentHasteRating));
    this.spinningCraneKickHits++;
    console.log("mark of the crane stacks", this.markoftheCraneStacks, event.timestamp);
    // Spinning Crane Kick deals damage 3 times over 1.5 seconds (reduced by haste)
    // This makes sure it only counts once per cast and only on casts that hit something
    if (event.timestamp - this.lastSpinningCraneKickTick > this.spinningCraneKickDuration) {
      this.totalMarksDuringHits += this.markoftheCraneStacks;
      this.lastSpinningCraneKickTick = event.timestamp;
    }
  }

  averageHits() {
    const averageHits = this.spinningCraneKickHits / this.abilityTracker.getAbility(SPELLS.SPINNING_CRANE_KICK.id).casts;
    return (
      <div className="flex">
        <div className="flex-main">
            <SpellIcon id={SPELLS.SPINNING_CRANE_KICK.id} /> Average hits
        </div>
        <div className="flex-sub text-right">
          {averageHits.toFixed(2)}
        </div>
      </div>
    );
  }

  averageMarks() {
    const averageMarks = this.totalMarksDuringHits / this.abilityTracker.getAbility(SPELLS.SPINNING_CRANE_KICK.id).casts;
    return (
      <div className="flex">
        <div className="flex-main">
            <SpellIcon id={SPELLS.MARK_OF_THE_CRANE.id} /> Average marks 
        </div>
        <div className="flex-sub text-right">
          {averageMarks.toFixed(2)}
        </div>
      </div>
    );
  }

  badCastsStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
            <SpellIcon id={SPELLS.SPINNING_CRANE_KICK.id} /> Bad casts         
        </div>
        <div className="flex-sub text-right">
          {this.badCasts}
        </div>
      </div>
    );
  }

  statistic() {
     return (
      <StatisticsListBox
        title="Spinning Crane Kick"
        tooltip=""
        style={{ minHeight: 186 }}
       >
         {this.averageMarks()}
         {this.averageHits()}
         {this.badCastsStatistic()}
      </StatisticsListBox>
    );  
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(4);
}

export default SpinningCraneKick;
