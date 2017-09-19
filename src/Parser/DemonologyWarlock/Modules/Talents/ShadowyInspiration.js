import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

const BUFF_DURATION = 15000;

class ShadowyInspiration extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  wastedInstants = 0;
  _expectedBuffEnd = undefined;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SHADOWY_INSPIRATION_TALENT.id);
  }

  on_toPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.SHADOWY_INSPIRATION_BUFF.id) {
      return;
    }
    this._expectedBuffEnd = event.timestamp + BUFF_DURATION;
  }

  on_toPlayer_refreshbuff(event) {
    if (event.ability.guid !== SPELLS.SHADOWY_INSPIRATION_BUFF.id) {
      return;
    }
    this.wastedInstants += 1;
    this._expectedBuffEnd = event.timestamp + BUFF_DURATION;
  }

  on_toPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.SHADOWY_INSPIRATION_BUFF.id) {
      return;
    }
    if (event.timestamp >= this._expectedBuffEnd) {
      // the buff fell off, another wasted instant
      this.wastedInstants += 1;
    }
  }

  suggestions(when) {
    const wastedPerMinute = this.wastedInstants / this.owner.fightDuration * 1000 * 60;
    when(wastedPerMinute).isGreaterThan(2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You should try to use your <SpellLink id={SPELLS.SHADOWY_INSPIRATION_BUFF.id}/> procs more as those instant <SpellLink id={SPELLS.SHADOW_BOLT.id}/> or <SpellLink id={SPELLS.DEMONBOLT.id}/> can be used while having to move or just to provide more Soul Shards.</span>)
          .icon(SPELLS.SHADOWY_INSPIRATION_TALENT.icon)
          .actual(`${actual.toFixed(2)} wasted procs per minute`)
          .recommended(`< ${recommended} is recommended`)
          .regular(recommended + 0.5).major(recommended + 1);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHADOWY_INSPIRATION_TALENT.id} />}
        value={this.wastedInstants}
        label="Wasted instant SB/DB"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default ShadowyInspiration;
