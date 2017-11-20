import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import HIT_TYPES from "Parser/Core/HIT_TYPES";
import Combatants from "Parser/Core/Modules/Combatants";

import SPELLS from "common/SPELLS/HUNTER";
import TALENTS from 'common/SPELLS/TALENTS/HUNTER';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from "common/SpellLink";
import SpellIcon from "common/SpellIcon";
import Icon from "common/Icon";
import { formatNumber, formatPercentage } from "common/format";
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

class Trueshot extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  trueshotCasts = 0;
  accumulatedFocusAtTSCast = 0;
  aimedShotsPrTS = 0;
  aimedCritsInTS = 0;
  totalCritsInTS = 0;
  totalCastsPrTS = 0;
  executeTrueshots = 0;
  startFocusForCombatant = 0;
  prepullTrueshots = 0;

  on_byPlayer_applybuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.TRUESHOT.id && !event.prepull) {
      return;
    }
    //ensures we only get 1 of these events
    if (this.trueshotCasts === 0) {
      //adds 1 to trueshotCasts to properly show that it was cast prepull
      this.trueshotCasts += 1;
      this.prepullTrueshots += 1;
    }
  }

  on_byPlayer_cast(event) {
//checks if we had a prepull trueshot, in which case the firstCast done symbolises our starting focus of that one trueshot
    if (this.prepullTrueshots > 0 && this.startFocusForCombatant === 0) {
      event.classResources.forEach(classResource => {
        if (classResource.type === RESOURCE_TYPES.FOCUS && classResource['amount'] > this.startFocusForCombatant) {
          this.startFocusForCombatant += classResource['amount'];
          this.accumulatedFocusAtTSCast += this.startFocusForCombatant;
        }
      });
    }
    const buffId = event.ability.guid;
    if (buffId === SPELLS.TRUESHOT.id) {
      this.trueshotCasts += 1;
      this.accumulatedFocusAtTSCast += event.classResources[0]['amount'] || 0;
      if (this.combatants.selected.hasBuff(SPELLS.BULLSEYE_TRAIT.id, event.timestamp)) {
        this.executeTrueshots += 1;
      }
    }
    const trueshotUptime = this.combatants.getBuffUptime(SPELLS.TRUESHOT.id);
    if (trueshotUptime > 0 && this.trueshotCasts === 0) {
      this.trueshotCasts += 1;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    const isCrit = event.hitType === HIT_TYPES.CRIT;

    if (!this.combatants.selected.hasBuff(SPELLS.TRUESHOT.id, event.timestamp)) {
      return;
    }
    this.totalCastsPrTS += 1;
    if (isCrit) {
      this.totalCritsInTS += 1;
      if (spellId === SPELLS.AIMED_SHOT.id) {
        this.aimedCritsInTS += 1;
      }
    }
    if (spellId !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    this.aimedShotsPrTS += 1;

  }

  statistic() {
    const averageAimedCasts = formatNumber(this.aimedShotsPrTS / this.trueshotCasts);
    const averageFocusAtTS = formatNumber(this.accumulatedFocusAtTSCast / this.trueshotCasts);
    const percentAimedCrits = formatPercentage(this.aimedCritsInTS / this.aimedShotsPrTS);
    const percentCastCrits = formatPercentage(this.totalCritsInTS / this.totalCastsPrTS);
    const uptimePrCast = ((this.combatants.getBuffUptime(SPELLS.TRUESHOT.id) / this.trueshotCasts) / 1000).toFixed(2);

    return (
      <StatisticBox icon={<SpellIcon id={SPELLS.TRUESHOT.id} />}
        value={(
          <span>
            {averageAimedCasts}{' '}
            <SpellIcon
              id={SPELLS.AIMED_SHOT.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {'  '}
            {averageFocusAtTS}{' '}
            <Icon
              icon='ability_hunter_focusfire'
              alt='Average Focus At Trueshot Cast'
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
          </span>
        )}
        label={'Trueshot info'}
        tooltip={`Information regarding your average Trueshot window: <ul> <li>You started your Trueshot windows with an average of ${averageFocusAtTS} focus.</li> <li> You hit an average of ${averageAimedCasts} Aimed Shots inside each Trueshot window. </li> <li> Your Trueshot Aimed Shots had a crit rate of ${percentAimedCrits}%. </li> <li>Your overall crit rate during Trueshot was ${percentCastCrits}%. </li> <li>You spent an average of ${uptimePrCast} seconds in trueshot pr cast of Trueshot.</li></ul>`} />
    );
  }

  suggestions(when) {
    const averageAimedCasts = formatNumber(this.aimedShotsPrTS / this.trueshotCasts);
    const averageFocusAtTS = formatNumber(this.accumulatedFocusAtTSCast / this.trueshotCasts);
    const uptimePrCast = ((this.combatants.getBuffUptime(SPELLS.TRUESHOT.id) / this.trueshotCasts) / 1000).toFixed(2);
    when(averageAimedCasts).isLessThan(8)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You only cast {averageAimedCasts} <SpellLink id={SPELLS.AIMED_SHOT.id} />s inside your average <SpellLink id={SPELLS.TRUESHOT.id} /> window. This is your only DPS cooldown, and it's important to maximize it to it's fullest potential by getting as many Aimed Shot squeezed in as possible, while still making sure that they are all within <SpellLink id={SPELLS.VULNERABLE.id} />. <br /> This can be done by making sure to use <SpellLink id={SPELLS.WINDBURST.id} /> to open <SpellLink id={SPELLS.VULNERABLE.id} /> windows, not using <SpellLink id={TALENTS.A_MURDER_OF_CROWS_TALENT_SHARED.id} /> while in <SpellLink id={SPELLS.TRUESHOT.id} /> or starting <SpellLink id={SPELLS.TRUESHOT.id} /> at higher focus. </span>)
          .icon(SPELLS.TRUESHOT.icon)
          .actual(`Average of ${averageAimedCasts} Aimed Shots pr Trueshot.`)
          .recommended(`>${recommended} is recommended`)
          //to make sure that if we go 1 cast below the recommended, it shows up as average, or 2 as major.
          .regular(recommended - 0.9)
          .major(recommended - 1.9);
      });
    when(averageFocusAtTS).isLessThan(90)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You started your average <SpellLink id={SPELLS.TRUESHOT.id} /> at {averageFocusAtTS} focus, try and pool a bit more before casting <SpellLink id={SPELLS.TRUESHOT.id} />. This can be done through casting an additional <SpellLink id={SPELLS.ARCANE_SHOT.id} /> or by monitoring the cooldown of <SpellLink id={SPELLS.TRUESHOT.id} /> and adjusting play to ensure your focus won't be depleted when it comes off cooldown.</span>)
          .icon(SPELLS.TRUESHOT.icon)
          .actual(`Average of ${averageFocusAtTS > 0 ? averageFocusAtTS : this.startFocusForCombatant} focus when starting Trueshot`)
          .recommended(`>${recommended} is recommended`)
          .regular(recommended - 10)
          .major(recommended - 20);
      });
    when(this.executeTrueshots).isLessThan(1)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You should make sure to have atleast 1 <SpellLink id={SPELLS.TRUESHOT.id} /> cast during execute (where you are buffed by <SpellLink id={SPELLS.BULLSEYE_TRAIT.id} />) to get as much out of <SpellLink id={SPELLS.TRUESHOT.id} /> as possible.</span>)
          .icon(SPELLS.TRUESHOT.icon)
          .actual(`You had ${this.executeTrueshots} trueshot casts during Bullseye`)
          .recommended(`casting atleast 1 trueshot in execute is recommended`)
          .major(recommended);
      });
    when(uptimePrCast).isLessThan(15)
      .addSuggestion((suggest, actual, recommended) => {
      return suggest(<span>You should make sure to utilise every possible second of <SpellLink id={SPELLS.TRUESHOT.id}/> uptime as you can. Remember to cast it atleast 15 seconds before the boss dies, so you don't lose out on valuable time, aswell as remember to not cast it until the boss has been engaged.</span>)
        .icon(SPELLS.TRUESHOT.icon)
        .actual(`You had an average of ${uptimePrCast} seconds of trueshot uptime per cast`)
        .recommended(`${recommended} seconds uptime per cast is recommended`)
        .regular(recommended-0.1)
        .major(recommended-0.5);
      });
  }
  statisticOrder = STATISTIC_ORDER.CORE(8);
}

export default Trueshot;
