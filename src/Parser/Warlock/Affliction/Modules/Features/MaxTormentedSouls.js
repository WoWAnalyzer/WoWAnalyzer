import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatDuration, formatPercentage } from 'common/format';
import StatisticBox from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

const MAX_SOULS = 12;

class MaxTormentedSouls extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  _fullSoulTimestamp = null;
  timeOnMaxStacks = 0;

  on_byPlayer_changebuffstack(event) {
    if (event.ability.guid !== SPELLS.WARLOCK_TORMENTED_SOULS.id) {
      return;
    }
    if (event.newStacks === MAX_SOULS) {
      // serves for applybuff and applybuffstack
      this._fullSoulTimestamp = event.timestamp;
    }
    else if (event.oldStacks === MAX_SOULS) {
      // removebuff or removebuffstack
      this.timeOnMaxStacks += event.timestamp - this._fullSoulTimestamp;
    }
  }

  get wastedPercentage() {
    return this.timeOnMaxStacks / this.owner.fightDuration;
  }

  get wastedSeconds() {
    return Math.floor(this.timeOnMaxStacks / 1000);
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedPercentage,
      isGreaterThan: {
        minor: 0.02,
        average: 0.04,
        major: 0.06,
      },
      style: 'percentage',
    };
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.WARLOCK_TORMENTED_SOULS.id}/>}
        value={`${formatDuration(this.wastedSeconds)} s`}
        label="Time on max stacks"
      />
    );
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You're wasting your <SpellLink id={SPELLS.WARLOCK_TORMENTED_SOULS.id}/>. Don't let them cap, even if it means pushing your <SpellLink id={SPELLS.DEADWIND_HARVESTER.id}/> buff past its maximum duration.</Wrapper>)
          .icon(SPELLS.WARLOCK_TORMENTED_SOULS.icon)
          .actual(`${formatPercentage(actual)}% of the fight (${formatDuration(this.wastedSeconds)} s) spent at 12 stacks.`)
          .recommended(`< ${formatPercentage(recommended)}% is recommended`);
      });
  }
}

export default MaxTormentedSouls;
