import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, CastEvent, EnergizeEvent, RemoveBuffEvent } from 'parser/core/Events';

import { ThresholdStyle, When } from 'parser/core/ParseResults';

import Statistic from 'interface/statistics/Statistic';
import BoringValueText from 'interface/statistics/components/BoringValueText'
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

const SOTC_MANA_PER_SECOND_RETURN_MINOR = 80;
const SOTC_MANA_PER_SECOND_RETURN_AVERAGE: number = SOTC_MANA_PER_SECOND_RETURN_MINOR - 15;
const SOTC_MANA_PER_SECOND_RETURN_MAJOR: number = SOTC_MANA_PER_SECOND_RETURN_MINOR - 15;

const debug = false;

class SpiritOfTheCrane extends Analyzer {
  castsTp: number = 0;
  buffTotm: number = 0;
  castsBk: number = 0;
  lastTotmBuffTimestamp: number = 0;
  totmOverCap: number = 0;
  totmBuffWasted: number = 0;
  totalTotmBuffs: number = 0;

  manaReturnSotc: number = 0;
  sotcWasted: number = 0;

  constructor(options: Options){
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id);

    if(!this.active){
      return;
    }

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY), this.firstStack);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY), this.gainStacks);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.TEACHINGS_OF_THE_MONASTERY), this.lostStacks);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.SPIRIT_OF_THE_CRANE_BUFF), this.stacksToMana);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TIGER_PALM), this.tigerPalm);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK), this.blackoutKick);
  }

  firstStack(event: ApplyBuffEvent) {

      this.buffTotm += 1;
      this.lastTotmBuffTimestamp = event.timestamp;
      debug && console.log(`ToTM at ${this.buffTotm}`);

  }

  gainStacks(event: ApplyBuffStackEvent) {
    this.buffTotm += 1;
    this.lastTotmBuffTimestamp = event.timestamp;
    debug && console.log(`ToTM at ${this.buffTotm}`);
  }

  lostStacks(event: RemoveBuffEvent) {
    debug && console.log(event.timestamp);
    if ((event.timestamp - this.lastTotmBuffTimestamp) > SPELLS.TEACHINGS_OF_THE_MONASTERY.buffDur) {
      this.totmBuffWasted += 1;
      this.buffTotm = 0;
      debug && console.log('ToTM Buff Wasted');
    }
    this.buffTotm = 0;
  }

  stacksToMana(event: EnergizeEvent) {
    this.manaReturnSotc += event.resourceChange - event.waste;
    this.sotcWasted += event.waste;
    debug && console.log(`SotC Entergize: ${event.resourceChange - event.waste} Total: ${this.manaReturnSotc}`);
    debug && console.log(`SotC Waste: ${event.waste} Total: ${this.sotcWasted} Timestamp: ${event.timestamp}`);
  }

  tigerPalm(event: CastEvent){
    if (!this.selectedCombatant.hasBuff(SPELLS.TEACHINGS_OF_THE_MONASTERY.id)) {
      return;
    }

    debug && console.log(`TP Casted at 3 stacks ${event.timestamp}`);
    this.lastTotmBuffTimestamp = event.timestamp;
    this.totmOverCap += 1;
  }

  blackoutKick(event: CastEvent) {
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
      style: ThresholdStyle.NUMBER,
    };
  }
  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          You are not utilizing your <SpellLink id={SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id} /> talent as effectively as you could. Make sure you are using any available downtime to use <SpellLink id={SPELLS.TIGER_PALM.id} /> and <SpellLink id={SPELLS.BLACKOUT_KICK.id} /> to take advantage of this talent.
        </>,
      )
        .icon(SPELLS.SPIRIT_OF_THE_CRANE_TALENT.icon)
        .actual(`${formatNumber(this.manaReturn)}${i18n._(t('monk.mistweaver.suggestions.spiritOfTheCrane.manaReturned')` mana returned through Spirit of the Crane`)}`)
        .recommended(`${formatNumber(recommended)} is the recommended mana return`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(30)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
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
      >
        <BoringValueText 
          label={<><SpellIcon id={SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id} /> Mana Returned</>}
        >
          <>
            {formatNumber(this.manaReturnSotc)}
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default SpiritOfTheCrane;
