import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import { formatDuration } from 'common/format';

const debug = false;

class Bolster extends Analyzer {
  badBlocks = 0;
  wastedBlockTime = 0;
  buffStartTime = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BOLSTER_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (!(spellId === SPELLS.LAST_STAND.id || spellId === SPELLS.SHIELD_BLOCK_BUFF.id)) {
      return;
    }

    if (this.selectedCombatant.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id) && this.selectedCombatant.hasBuff(SPELLS.LAST_STAND.id)) {
      this.badBlocks += 1;
      this.buffStartTime += event.timestamp;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (!(spellId === SPELLS.LAST_STAND.id || spellId === SPELLS.SHIELD_BLOCK_BUFF.id)) {
      return;
    }

    if (this.buffStartTime === 0) {
      return;
    }

    this.wastedBlockTime += event.timestamp - this.buffStartTime;
    this.buffStartTime = 0;
    debug && console.log(`Wasted Block Time: ${this.wastedBlockTime}`);
  }

  on_fightend() {
    if (debug) {
      console.log(`Overlapped Casts ${this.badBlocks}`);
      console.log(`Total wasted block time ${formatDuration(this.wastedBlockTime / 1000)}`);
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.badBlocks,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest('You should never overlap Shield Block and Last stand when you take the Bolster talent.')
            .icon(SPELLS.BOLSTER_TALENT.icon)
            .actual(`You overlapped shield block and last stand ${this.badBlocks} times.`)
            .recommended(`0 is recommended`);
        });
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.BOLSTER_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(3)}
        value={`${ this.badBlocks }`}
        label="Last Stand and Shield Block overlapped"
        tooltip={`${formatDuration(this.wastedBlockTime / 1000)} wasted block time.`}
      />
    );
  }
}

export default Bolster;
