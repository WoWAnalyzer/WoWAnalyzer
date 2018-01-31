import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

const MAX_STACKS = 4;

class WayOfTheMokNathal extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  _currentStacks = 0;
  _fourStackUptime = 0;
  _fourStackStart = 0;
  _timesDropped = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.WAY_OF_THE_MOKNATHAL_TALENT.id);
  }

  get overallUptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.MOKNATHAL_TACTICS.id) / this.owner.fightDuration;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MOKNATHAL_TACTICS.id) {
      return;
    }
    this._currentStacks = 1;
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MOKNATHAL_TACTICS.id) {
      return;
    }
    this._currentStacks = event.stack;
    if (this._currentStacks === MAX_STACKS) {
      this._fourStackStart = event.timestamp;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MOKNATHAL_TACTICS.id) {
      return;
    }
    if (this._currentStacks === MAX_STACKS) {
      this._fourStackUptime += event.timestamp - this._fourStackStart;
    }
    this._currentStacks = 0;
    this._timesDropped += 1;
  }

  on_finished() {
    if (this._currentStacks === MAX_STACKS) {
      this._fourStackUptime += this.owner.fight.end_time - this._fourStackStart;
    }
  }

  get timesDroppedThreshold() {
    return {
      actual: this._timesDropped,
      isGreaterThan: {
        minor: 0.9,
        average: 1.9,
        major: 2.9,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.timesDroppedThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Try your best to maintain 4 stacks on <SpellLink id={SPELLS.MOKNATHAL_TACTICS.id} icon />. This can be achieved by casting <SpellLink id={SPELLS.RAPTOR_STRIKE.id} icon /> right before having to halt attacking for an extended period of time. </Wrapper>)
        .icon(SPELLS.WAY_OF_THE_MOKNATHAL_TALENT.icon)
        .actual(`You dropped Mok'Nathals Tactic ${this._timesDropped} times`)
        .recommended(`${recommended} is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.WAY_OF_THE_MOKNATHAL_TALENT.id} />}
        value={`${formatPercentage(this._fourStackUptime / this.owner.fightDuration)}%`}
        label="4 stack uptime"
        tooltip={`Way of the MokNathal breakdown:
          <ul>
            <li> Overall uptime: ${formatPercentage(this.overallUptime)}%</li>
            <li> Times dropped: ${this._timesDropped}</li>
          </ul> `} />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default WayOfTheMokNathal;
