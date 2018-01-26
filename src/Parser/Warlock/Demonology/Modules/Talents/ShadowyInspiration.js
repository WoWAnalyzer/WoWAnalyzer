import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

const BUFF_DURATION = 15000;

class ShadowyInspiration extends Analyzer {
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

  get suggestionThresholds() {
    const wastedPerMinute = this.wastedInstants / this.owner.fightDuration * 1000 * 60;
    return {
      actual: wastedPerMinute,
      isGreaterThan: {
        minor: 2,
        average: 2.5,
        major: 3,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You should try to use your <SpellLink id={SPELLS.SHADOWY_INSPIRATION_BUFF.id}/> procs more as those instant <SpellLink id={SPELLS.SHADOW_BOLT.id}/> or <SpellLink id={SPELLS.DEMONBOLT_TALENT.id}/> can be used while having to move or just to provide more Soul Shards.</Wrapper>)
          .icon(SPELLS.SHADOWY_INSPIRATION_TALENT.icon)
          .actual(`${actual.toFixed(2)} wasted procs per minute`)
          .recommended(`< ${recommended} is recommended`);
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
