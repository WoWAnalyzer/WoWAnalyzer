import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import { formatDuration, formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import StatisticsListBox from 'Main/StatisticsListBox';

const MAX_SOULS = 12;

class TormentedSouls extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  _fullSoulTimestamp = null;
  totalSouls = 0;
  soulsFromRend = 0;
  soulsFromRendWhileReap = 0;
  timeOnMaxStacks = 0;

  on_byPlayer_changebuffstack(event) {
    if (event.ability.guid !== SPELLS.WARLOCK_TORMENTED_SOULS.id) {
      return;
    }
    if (event.oldStacks < event.newStacks) {
      this.totalSouls += 1;  // only 1 soul at a time can be added
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

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.REND_SOUL.id) {
      return;
    }
    this.soulsFromRend += 1;
    if (this.combatants.selected.hasBuff(SPELLS.DEADWIND_HARVESTER.id, event.timestamp)) {
      this.soulsFromRendWhileReap += 1;
    }
  }

  get maxStackPercentage() {
    return this.timeOnMaxStacks / this.owner.fightDuration;
  }

  get maxStacksSeconds() {
    return Math.floor(this.timeOnMaxStacks / 1000);
  }

  get soulsPerMinute() {
    return this.totalSouls / (this.owner.fightDuration / 1000 / 60);
  }

  get suggestionThresholds() {
    return {
      actual: this.maxStackPercentage,
      isGreaterThan: {
        minor: 0.02,
        average: 0.04,
        major: 0.06,
      },
      style: 'percentage',
    };
  }

  get totalSoulStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.WARLOCK_TORMENTED_SOULS.id} icon /> gained <i>per minute</i>
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`${this.totalSouls} souls in total`}>
            {this.soulsPerMinute.toFixed(2)}
          </dfn>
        </div>
      </div>
    );
  }

  get rendSoulStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.REND_SOUL.id} icon /> procs
        </div>
        <div className="flex-sub text-right">
          {this.soulsFromRend}
        </div>
      </div>
    );
  }

  get rendSoulReapStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.REND_SOUL.id} icon /> procs with <SpellLink id={SPELLS.REAP_SOULS.id} icon/> active
        </div>
        <div className="flex-sub text-right">
          {this.soulsFromRendWhileReap}
        </div>
      </div>
    );
  }

  get maxStackStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          Time on max stacks
        </div>
        <div className="flex-sub text-right">
          {formatDuration(this.maxStacksSeconds)} s
        </div>
      </div>
    );
  }

  statistic() {
    return (
      <StatisticsListBox title={<SpellLink id={SPELLS.WARLOCK_TORMENTED_SOULS.id} icon/>}>
        {this.maxStackStatistic}
        {this.totalSoulStatistic}
        {this.rendSoulStatistic}
        {this.rendSoulReapStatistic}
      </StatisticsListBox>
    );
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You're wasting your <SpellLink id={SPELLS.WARLOCK_TORMENTED_SOULS.id}/>. Don't let them cap, even if it means pushing your <SpellLink id={SPELLS.DEADWIND_HARVESTER.id}/> buff past its maximum duration.</Wrapper>)
          .icon(SPELLS.WARLOCK_TORMENTED_SOULS.icon)
          .actual(`${formatPercentage(actual)}% of the fight (${formatDuration(this.maxStacksSeconds)} s) spent at 12 stacks.`)
          .recommended(`< ${formatPercentage(recommended)}% is recommended`);
      });
  }
}

export default TormentedSouls;
