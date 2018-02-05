import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import MarkoftheCraneTarget from './MarkoftheCraneTarget';


class SpinningCraneKick extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  badCasts = 0;
  averageStacks = 0;
  averageTargets = 0;
  averageRatio = 0;
  markoftheCraneTargets = [];

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetId;
    const targetInstance = event.targetInstance;
    if (spellId !== SPELLS.MARK_OF_THE_CRANE.id) {
      return;
    }
    const markoftheCraneTarget = MarkoftheCraneTarget(targetId, targetInstance, event.timestamp);
    this.markoftheCraneTargets.push(markoftheCraneTarget);
  }

  on_byPlayer_refreshdebuff(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    const targetInstance = event.targetInstance;
    if (spellId !== SPELLS.MARK_OF_THE_CRANE.id) {
      return;
    }
    const markoftheCraneTarget = MarkoftheCraneTarget(targetId, targetInstance, event.timestamp);
    if (this.markoftheCraneTargets.includes(markoftheCraneTarget)) {
      this.markoftheCraneTargets.find(markoftheCraneTarget).refreshMark(event.timestamp);
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    //let markoftheCraneStacks = 0;
    if (spellId !== SPELLS.SPINNING_CRANE_KICK_DAMAGE.id) {
      return;
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SPINNING_CRANE_KICK_DAMAGE.id} />}
        value={this.averageRatio.toFixed(2)}
        label={(
          <span> Ratio between <SpellLink id={SPELLS.MARK_OF_THE_CRANE.id} /> stacks and targets hit by <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} /> </span>
        )}
      />
    );  
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(4);
}

export default SpinningCraneKick;
