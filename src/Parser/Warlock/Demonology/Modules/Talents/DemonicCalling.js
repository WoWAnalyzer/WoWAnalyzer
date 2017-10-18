import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

const BUFF_DURATION = 20000;

class DemonicCalling extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  wastedFreeCasts = 0;
  _expectedBuffEnd = undefined;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.DEMONIC_CALLING_TALENT.id);
  }

  on_toPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.DEMONIC_CALLING_BUFF.id) {
      return;
    }
    this._expectedBuffEnd = event.timestamp + BUFF_DURATION;
  }

  on_toPlayer_refreshbuff(event) {
    if (event.ability.guid !== SPELLS.DEMONIC_CALLING_BUFF.id) {
      return;
    }
    this.wastedFreeCasts += 1;
    this._expectedBuffEnd = event.timestamp + BUFF_DURATION;
  }

  on_toPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.DEMONIC_CALLING_BUFF.id) {
      return;
    }
    if (event.timestamp >= this._expectedBuffEnd) {
      // the buff fell off, another wasted instant
      this.wastedFreeCasts += 1;
    }
  }

  suggestions(when) {
    const wastedPerMinute = this.wastedFreeCasts / this.owner.fightDuration * 1000 * 60;
    when(wastedPerMinute).isGreaterThan(1)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You should try to use your free <SpellLink id={SPELLS.CALL_DREADSTALKERS.id} /> as much as possible as Dreadstalkers make a great portion of your damage.<br/><br/><small>NOTE: Some wasted procs are probably unavoidable (e.g. Dreadstalkers on cooldown, proc waiting but gets overwritten by another)</small></span>)
          .icon(SPELLS.DEMONIC_CALLING_TALENT.icon)
          .actual(`${actual.toFixed(2)} wasted procs per minute`)
          .recommended(`< ${recommended} is recommended`)
          .regular(recommended + 0.5).major(recommended + 1);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DEMONIC_CALLING_TALENT.id} />}
        value={this.wastedFreeCasts}
        label="Wasted free Dreadstalkers"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default DemonicCalling;
