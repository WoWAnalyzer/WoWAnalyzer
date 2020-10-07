import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const SOTC_MANA_PER_SECOND_RETURN_MINOR = 80;
const SOTC_MANA_PER_SECOND_RETURN_AVERAGE = SOTC_MANA_PER_SECOND_RETURN_MINOR - 15;
const SOTC_MANA_PER_SECOND_RETURN_MAJOR = SOTC_MANA_PER_SECOND_RETURN_MINOR - 15;

const debug = false;

class SpiritOfTheCrane extends Analyzer {
  castsTp = 0;
  buffTotm = 0;
  castsBk = 0;
  lastTotmBuffTimestamp = null;
  totmOverCap = 0;
  totmBuffWasted = 0;
  totalTotmBuffs = 0;

  manaReturnSotc = 0;
  sotcWasted = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id);

    if(!this.active){
      return;
    }

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY), this.firstStack);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY), this.gainStacks);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY), this.lostStacks);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.SPIRIT_OF_THE_CRANE_BUFF), this.stacksToMana);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHI_BURST_TALENT), this.tigerPalm);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHI_BURST_TALENT), this.blackoutKick);
  }

  firstStack(event) {

      this.buffTotm += 1;
      this.lastTotmBuffTimestamp = event.timestamp;
      debug && console.log(`ToTM at ${this.buffTotm}`);
    
  }

  gainStacks(event) {
    this.buffTotm += 1;
    this.lastTotmBuffTimestamp = event.timestamp;
    debug && console.log(`ToTM at ${this.buffTotm}`);
  }

  lostStacks(event) {
    debug && console.log(event.timestamp);
    if ((event.timestamp - this.lastTotmBuffTimestamp) > SPELLS.TEACHINGS_OF_THE_MONASTERY.buffDur) {
      this.totmBuffWasted += 1;
      this.buffTotm = 0;
      debug && console.log('ToTM Buff Wasted');
    }
    this.buffTotm = 0;    
  }

  stacksToMana(event) {
    this.manaReturnSotc += event.resourceChange - event.waste;
    this.sotcWasted += event.waste;
    debug && console.log(`SotC Entergize: ${event.resourceChange - event.waste} Total: ${this.manaReturnSotc}`);
    debug && console.log(`SotC Waste: ${event.waste} Total: ${this.sotcWasted} Timestamp: ${event.timestamp}`);
  }

  tigerPalm(event){
    if (!this.selectedCombatant.hasBuff(SPELLS.TEACHINGS_OF_THE_MONASTERY.id)) {
      return;
    }

    debug && console.log(`TP Casted at 3 stacks ${event.timestamp}`);
    this.lastTotmBuffTimestamp = event.timestamp;
    this.totmOverCap += 1;
  }

  blackoutKick(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.TEACHINGS_OF_THE_MONASTERY.id)) {
      return;
    }

    if (this.buffTotm > 0) {
      if (this.selectedCombatant.hasBuff(SPELLS.TEACHINGS_OF_THE_MONASTERY.id)) {
        this.totalTotmBuffs += this.buffTotm;
        debug && console.log(`Black Kick Casted with Totm at ${this.buffTotm} stacks`);
      }
    }
  }

  get manaReturn() {
    return this.manaReturnSotc;
  }

  get suggestionThresholds() {
    return {
      actual: this.manaReturn,
      isLessThan: {
        minor: SOTC_MANA_PER_SECOND_RETURN_MINOR * (this.owner.fightDuration / 1000),
        average: SOTC_MANA_PER_SECOND_RETURN_AVERAGE * (this.owner.fightDuration / 1000),
        major: SOTC_MANA_PER_SECOND_RETURN_MAJOR * (this.owner.fightDuration / 1000),
      },
      style: 'number',
    };
  }
  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          You are not utilizing your <SpellLink id={SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id} /> talent as effectively as you could. Make sure you are using any available downtime to use <SpellLink id={SPELLS.TIGER_PALM.id} /> and <SpellLink id={SPELLS.BLACKOUT_KICK.id} /> to take advantage of this talent.
        </>,
      )
        .icon(SPELLS.SPIRIT_OF_THE_CRANE_TALENT.icon)
        .actual(`${formatNumber(this.manaReturn)} mana returned through Spirit of the Crane`)
        .recommended(`${formatNumber(recommended)} is the recommended mana return`));
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id}
        position={STATISTIC_ORDER.CORE(30)}
        value={`${formatNumber(this.manaReturnSotc)}`}
        label="Mana Returned"
        tooltip={(
          <>
            You gained a raw total of {((this.manaReturnSotc + this.sotcWasted) / 1000).toFixed(0)}k mana from SotC with {(this.sotcWasted / 1000).toFixed(0)}k wasted.<br />

            You lost {(this.totmOverCap + this.totmBuffWasted)} Teachings of the Monestery stacks.<br />
            <ul>
              {this.totmOverCap > 0 && <li>You overcapped Teachings {(this.totmOverCap)} times</li>}
              {this.totmBuffWasted > 0 && <li>You let Teachings drop off {(this.totmBuffWasted)} times</li>}
            </ul>
          </>
        )}
      />
    );
  }

  on_fightend() {
    if (debug) {
      console.log(`TotM Buffs Wasted:${this.totmBuffWasted}`);
      console.log(`TotM Buffs Overcap:${this.totmOverCap}`);
      console.log(`SotC Mana Returned:${this.manaReturnSotc}`);
      console.log(`Total TotM Buffs:${this.totalTotmBuffs}`);
      console.log(`SotC Waste Total: ${this.sotcWasted}`);
      console.log(`SotC Total: ${this.sotcWasted + this.manaReturnSotc}`);
    }
  }
}

export default SpiritOfTheCrane;
