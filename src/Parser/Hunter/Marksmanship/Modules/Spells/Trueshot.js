import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import HIT_TYPES from "Parser/Core/HIT_TYPES";
import Combatants from "Parser/Core/Modules/Combatants";

import SPELLS from "common/SPELLS/HUNTER";
import TALENTS from 'common/SPELLS/TALENTS/HUNTER';
import StatisticBox from "Main/StatisticBox";
import SpellLink from "common/SpellLink";
import SpellIcon from "common/SpellIcon";
import Icon from "common/Icon";
import { formatNumber, formatPercentage } from "common/format";

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

  on_byPlayer_cast(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.TRUESHOT.id) {
      return;
    }
    this.trueshotCasts += 1;
    this.accumulatedFocusAtTSCast += event.classResources[0]['amount'] || 0;
    if(this.combatants.selected.hasBuff(SPELLS.BULLSEYE_TRAIT.id, event.timestamp)) {
      this.executeTrueshots += 1;
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
        tooltip={`You started your Trueshot windows with an average of ${averageFocusAtTS} focus.<br /> You hit an average of ${averageAimedCasts} Aimed Shots inside each Trueshot window, and they had a crit rate of ${percentAimedCrits}%. <br /> Your overall crit rate during Trueshot was ${percentCastCrits}%.`} />
    );
  }

  suggestions(when) {
    const averageAimedCasts = formatNumber(this.aimedShotsPrTS / this.trueshotCasts);
    const averageFocusAtTS = formatNumber(this.accumulatedFocusAtTSCast / this.trueshotCasts);
    when(averageAimedCasts).isLessThan(8)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You only cast {averageAimedCasts} <SpellLink id={SPELLS.AIMED_SHOT.id} />s inside your average <SpellLink id={SPELLS.TRUESHOT.id} /> window. This is your only DPS cooldown, and it's important to maximize it to it's fullest potential by getting as many Aimed Shot squeezed in as possible, while still making sure that they are all within <SpellLink id={SPELLS.VULNERABLE.id}/>. <br /> This can be done by making sure to use <SpellLink id={SPELLS.WINDBURST.id} /> to open <SpellLink id={SPELLS.VULNERABLE.id}/> windows, not using <SpellLink id={TALENTS.A_MURDER_OF_CROWS_TALENT_SHARED.id}/> while in <SpellLink id={SPELLS.TRUESHOT.id}/> or starting <SpellLink id={SPELLS.TRUESHOT.id}/> at higher focus. </span>)
          .icon(SPELLS.TRUESHOT.icon)
          .actual(`Average of ${averageAimedCasts} Aimed Shots pr Trueshot.`)
          .recommended(`>${recommended} is recommended`)
          //to make sure that if we go 1 cast below the recommended, it shows up as average, or 2 as major.
          .regular(recommended - 0.9)
          .major(recommended - 1.9);
      });
    when(averageFocusAtTS).isLessThan(90)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You started your average <SpellLink id={SPELLS.TRUESHOT.id}/> at {averageFocusAtTS} focus, try and pool a bit more before casting <SpellLink id={SPELLS.TRUESHOT.id}/>. This can be done through casting an additional <SpellLink id={SPELLS.ARCANE_SHOT.id}/> or by monitoring the cooldown of <SpellLink id={SPELLS.TRUESHOT.id}/> and adjusting play to ensure your focus won't be depleted when it comes off cooldown.</span>)
          .icon(SPELLS.TRUESHOT.icon)
          .actual(`Average of ${averageFocusAtTS} focus when starting Trueshot`)
          .recommended(`>${recommended} is recommended`)
          .regular(recommended - 10)
          .major(recommended - 20);
      });
    when(this.executeTrueshots).isLessThan(1)
      .addSuggestion((suggest, actual, recommended) => {
      return suggest(<span>You should make sure to have atleast 1 <SpellLink id={SPELLS.TRUESHOT.id}/> cast during execute (where you are buffed by <SpellLink id={SPELLS.BULLSEYE_TRAIT.id}/>) to get as much out of <SpellLink id={SPELLS.TRUESHOT.id}/> as possible.</span>)
        .icon(SPELLS.TRUESHOT.icon)
        .actual(`You had ${this.executeTrueshots} trueshot casts during Bullseye`)
        .recommended(`casting atleast 1 trueshot in execute is recommended`)
        .major(recommended);
      });
  }
}

export default Trueshot;
