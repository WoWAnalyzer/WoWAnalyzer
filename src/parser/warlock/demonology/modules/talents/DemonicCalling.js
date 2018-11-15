import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const BUFF_DURATION = 20000;
const debug = false;

class DemonicCalling extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  wastedProcs = 0;
  _expectedBuffEnd = undefined;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DEMONIC_CALLING_TALENT.id);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CALLING_BUFF), this.applyDemonicCallingBuff);
    this.addEventListener(Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CALLING_BUFF), this.refreshDemonicCallingBuff);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CALLING_BUFF), this.removeDemonicCallingBuff);
  }

  applyDemonicCallingBuff(event) {
    debug && this.log('DC applied');
    this._expectedBuffEnd = event.timestamp + BUFF_DURATION;
  }

  refreshDemonicCallingBuff(event) {
    debug && this.log('DC refreshed');
    if (this.spellUsable.isAvailable(SPELLS.CALL_DREADSTALKERS.id)) {
      this.wastedProcs += 1;
      debug && this.log('Dreadstalkers were available, wasted proc');
    }
    this._expectedBuffEnd = event.timestamp + BUFF_DURATION;
  }

  removeDemonicCallingBuff(event) {
    // TODO same check as in refresh
    if (event.timestamp >= this._expectedBuffEnd) {
      // the buff fell off, another wasted instant
      this.wastedProcs += 1;
      debug && this.log('DC fell off, wasted proc');
    }
  }

  get suggestionThresholds() {
    const wastedPerMinute = this.wastedProcs / this.owner.fightDuration * 1000 * 60;
    return {
      actual: wastedPerMinute,
      isGreaterThan: {
        minor: 1,
        average: 1.5,
        major: 2,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You should try to use your cheaper <SpellLink id={SPELLS.CALL_DREADSTALKERS.id} /> as much as possible as Dreadstalkers make a great portion of your damage.<br /><br /><small>NOTE: Some wasted procs are probably unavoidable (e.g. <SpellLink id={SPELLS.CALL_DREADSTALKERS.id} /> on cooldown, proc waiting but gets overwritten by another)</small></>)
          .icon(SPELLS.DEMONIC_CALLING_TALENT.icon)
          .actual(`${actual.toFixed(2)} wasted procs per minute`)
          .recommended(`< ${recommended} is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DEMONIC_CALLING_TALENT.id} />}
        value={this.wastedProcs}
        label="Wasted cheaper Dreadstalkers"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default DemonicCalling;
