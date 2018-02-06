import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class SpinningCraneKick extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  badCasts = 0;
  markoftheCraneTargets = [];
  lastSpinningCraneKickTick = 0;
  totalMarksDuringHits = 0;

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
    //console.log(event.targetID, targetInstance, event.timestamp);
    const markoftheCraneTarget = {targetID: event.targetID, targetInstance: targetInstance, timestamp: event.timestamp };
    this.markoftheCraneTargets.push(markoftheCraneTarget);
    console.log(markoftheCraneTarget, "added");
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

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    let markoftheCraneStacks = 0;
    if (spellId !== SPELLS.SPINNING_CRANE_KICK_DAMAGE.id) {
      return;
    }
    this.spinningCraneKickHits++;

    let i = 0;
    while (i <= this.markoftheCraneTargets.length - 1) {
      if (event.timestamp - this.markoftheCraneTargets[i].timestamp > 15000) {
        console.log(this.markoftheCraneTargets[i], "Mark of the Crane expired and removed");
        this.markoftheCraneTargets.splice(this.markoftheCraneTargets[i], 1);
       }
      else {
        markoftheCraneStacks++;
        console.log(this.markoftheCraneTargets[i], "Mark of the Crane found and counted");
      }
      i++;
    }
    console.log("mark of the crane stacks", markoftheCraneStacks);
    this.totalMarksDuringHits += markoftheCraneStacks;
  }

  statistic() {
    const averageRatio = this.totalMarksDuringHits / this.spinningCraneKickHits;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SPINNING_CRANE_KICK_DAMAGE.id} />}
        value={averageRatio.toFixed(2)}
        label={(
          <span> Ratio between <SpellLink id={SPELLS.MARK_OF_THE_CRANE.id} /> stacks and targets hit by <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} /> </span>
        )}
      />
    );  
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(4);
}

export default SpinningCraneKick;
