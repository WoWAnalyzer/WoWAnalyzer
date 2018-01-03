import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import Wrapper from 'common/Wrapper';

import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const SOTC_MANA_PER_SECOND_RETURN_MINOR = 640;
const SOTC_MANA_PER_SECOND_RETURN_AVERAGE = SOTC_MANA_PER_SECOND_RETURN_MINOR - 100;
const SOTC_MANA_PER_SECOND_RETURN_MAJOR = SOTC_MANA_PER_SECOND_RETURN_MINOR - 100;

const debug = false;

class SpiritOfTheCrane extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  castsTp = 0;
  buffTotm = 0;
  castsBk = 0;
  lastTotmBuffTimestamp = null;
  totmOverCap = 0;
  totmBuffWasted = 0;
  totalTotmBuffs = 0;

  manaReturnSotc = 0;
  sotcWasted = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.TEACHINGS_OF_THE_MONASTERY.id) {
      this.buffTotm += 1;
      this.lastTotmBuffTimestamp = event.timestamp;
      debug && console.log(`ToTM at ${this.buffTotm}`);
    }
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.TEACHINGS_OF_THE_MONASTERY.id) {
      this.buffTotm += 1;
      this.lastTotmBuffTimestamp = event.timestamp;
      debug && console.log(`ToTM at ${this.buffTotm}`);
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    if (SPELLS.TEACHINGS_OF_THE_MONASTERY.id === spellId) {
      debug && console.log(event.timestamp);
      if ((event.timestamp - this.lastTotmBuffTimestamp) > SPELLS.TEACHINGS_OF_THE_MONASTERY.buffDur) {
        this.totmBuffWasted += 1;
        this.buffTotm = 0;
        debug && console.log('ToTM Buff Wasted');
      }
      this.buffTotm = 0;
      // debug && console.log('ToTM Buff Zero');
    }
  }

  on_byPlayer_energize(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SPIRIT_OF_THE_CRANE_BUFF.id) {
      this.manaReturnSotc += event.resourceChange - event.waste;
      this.sotcWasted += event.waste;
      debug && console.log(`SotC Entergize: ${event.resourceChange - event.waste} Total: ${this.manaReturnSotc}`);
      debug && console.log(`SotC Waste: ${event.waste} Total: ${this.sotcWasted} Timestamp: ${event.timestamp}`);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (!this.combatants.selected.hasBuff(SPELLS.TEACHINGS_OF_THE_MONASTERY.id)) {
        // console.log('No TotM Buff');
      return;
    }

      // Need to track when you over cap Teachings stacks.  There is no apply aura event fired, so manually tracking stacks.
    if (spellId === SPELLS.TIGER_PALM.id && this.buffTotm === 3) {
      debug && console.log(`TP Casted at 3 stacks ${event.timestamp}`);
      this.lastTotmBuffTimestamp = event.timestamp;
      this.totmOverCap += 1;
    }

    if (spellId === SPELLS.BLACKOUT_KICK.id && this.buffTotm > 0) {
      if (this.combatants.selected.hasBuff(SPELLS.TEACHINGS_OF_THE_MONASTERY.id)) {
        this.totalTotmBuffs += this.buffTotm;
          // this.manaReturnSotc += (this.buffTotm * (baseMana * SPELLS.TEACHINGS_OF_THE_MONASTERY.manaRet));
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
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <Wrapper>
            You are not utilizing your <SpellLink id={SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id} /> talent as effectively as you could. Make sure you are using any available downtime to use <SpellLink id={SPELLS.TIGER_PALM.id} /> and <SpellLink id={SPELLS.BLACKOUT_KICK.id} /> to take advantage of this talent.
          </Wrapper>
        )
          .icon(SPELLS.SPIRIT_OF_THE_CRANE_TALENT.icon)
          .actual(`${formatNumber(this.manaReturn)} mana returned through Spirit of the Crane`)
          .recommended(`${formatNumber(recommended)} is the recommended mana return`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id} />}
        value={`${formatNumber(this.manaReturnSotc)}`}
        label={(
          <dfn data-tip={`
              You gained a raw total of ${((this.manaReturnSotc + this.sotcWasted) / 1000).toFixed(0)}k mana from SotC with ${(this.sotcWasted / 1000).toFixed(0)}k wasted.<br>
              You lost ${(this.totmOverCap + this.totmBuffWasted)} Teachings of the Monestery stacks
            <ul>
              ${this.totmOverCap > 0 ?
              `<li>You overcapped Teachings ${(this.totmOverCap)} times</li>`
              : ''
              }
              ${this.totmBuffWasted > 0 ?
              `<li>You let Teachings drop off ${(this.totmBuffWasted)} times</li>`
              : ''
              }
            </ul>
            `}
          >
            Mana Returned
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(30);

  on_finished() {
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
