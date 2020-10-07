import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import { formatDuration } from 'common/format';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';

const debug = false;
const BUFFS = [SPELLS.LAST_STAND, SPELLS.SHIELD_BLOCK_BUFF];

class Bolster extends Analyzer {
  badBlocks = 0;
  wastedBlockTime = 0;
  buffStartTime = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BOLSTER_TALENT.id);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(BUFFS), this.applyBlockBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(BUFFS), this.removeBlockBuff);
    debug && this.addEventListener(Events.fightend, this.fightEndDebug);
  }

  applyBlockBuff(event: ApplyBuffEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.SHIELD_BLOCK_BUFF.id) && this.selectedCombatant.hasBuff(SPELLS.LAST_STAND.id)) {
      this.badBlocks += 1;
      this.buffStartTime += event.timestamp;
    }
  }

  removeBlockBuff(event: RemoveBuffEvent) {
    if (this.buffStartTime === 0) {
      return;
    }
    this.wastedBlockTime += event.timestamp - this.buffStartTime;
    this.buffStartTime = 0;
    debug && console.log(`Wasted Block Time: ${this.wastedBlockTime}`);
  }

  fightEndDebug() {
    console.log(`Overlapped Casts ${this.badBlocks}`);
    console.log(`Total wasted block time ${formatDuration(this.wastedBlockTime / 1000)}`);
  }

  get suggestionThresholds() {
    return {
      actual: this.badBlocks,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
        .addSuggestion((suggest) => suggest('You should never overlap Shield Block and Last stand when you take the Bolster talent.')
            .icon(SPELLS.BOLSTER_TALENT.icon)
            .actual(`You overlapped shield block and last stand ${this.badBlocks} times.`)
            .recommended(`0 is recommended`));
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.BOLSTER_TALENT.id}
        icon={undefined} // will be overriden by talent; required because TSB is not converted to TS
        position={STATISTIC_ORDER.OPTIONAL(3)}
        value={`${ this.badBlocks }`}
        label="Last Stand and Shield Block overlapped"
        tooltip={`${formatDuration(this.wastedBlockTime / 1000)} wasted block time.`}
      />
    );
  }
}

export default Bolster;
