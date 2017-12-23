import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox from 'Main/StatisticBox';
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';

//Duration of Bestial Wrath
const BESTIAL_WRATH_DURATION = 15000;

//You generally use aspect of the wild if you have more than 7 seconds remaining in bestial wrath
const BESTIAL_WRATH_REMAINING_USE_ASPECT = 7000;

//remaining time in combat where you just use AotW regardless
const FIGHT_ENDING_USE_ASPECT = 15000;

class AspectOfTheWild extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  totalAspectCasts = 0;
  badAspectCasts = 0;
  goodAspectCasts = 0;
  bestialWrathStart = 0;
  bestialWrathEnd = 0;
  lastAspectCastTime = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ASPECT_OF_THE_WILD.id && spellId !== SPELLS.BESTIAL_WRATH.id) {
      return;
    }
    if (spellId === SPELLS.BESTIAL_WRATH.id) {
      this.bestialWrathStart = event.timestamp;
      this.bestialWrathEnd = this.bestialWrathStart + BESTIAL_WRATH_DURATION;
    }
    if (spellId === SPELLS.ASPECT_OF_THE_WILD.id) {
      this.totalAspectCasts += 1;
      if (this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id) && event.timestamp < (this.bestialWrathEnd - BESTIAL_WRATH_REMAINING_USE_ASPECT)) {
        this.goodAspectCasts += 1;
      } else {
        this.badAspectCasts += 1;
        this.lastAspectCastTime = event.timestamp;
      }
    }
  }

  on_finished() {
    if (this.lastAspectCastTime > (this.owner.fightDuration - FIGHT_ENDING_USE_ASPECT) && this.badAspectCasts > 0) {
      this.badAspectCasts -= 1;
      this.goodAspectCasts += 1;
    }
  }
  get badCastThreshold() {
    return {
      actual: this.badCrowsCasts,
      isGreaterThan: {
        minor: 0,
        average: 0.9,
        major: 1.9,
      },
      style: 'number',
    };
  }
  suggestions(when) {
    const {
      isGreaterThan: {
        minor,
        average,
        major,
      },
    } = this.badCastThreshold;
    when(this.badAspectCasts).isGreaterThan(minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Don't cast <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} /> without <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> up and atleast 7 seconds remaining on the buff (or with under than 15 seconds remaining of the encounter) </span>)
          .icon(SPELLS.ASPECT_OF_THE_WILD.icon)
          .actual(`You cast Aspect of the Wild ${this.badAspectCasts} times without Bestial Wrath up or with less than 7s remaining of Bestial Wrath duration`)
          .recommended(`${recommended} is recommended`)
          .regular(average)
          .major(major);
      });
  }
  statistic() {
    let tooltipText = `You cast Aspect of the Wild a total of ${this.totalAspectCasts} times.`;
    tooltipText += this.badAspectCasts > 0 ? `<ul><li>You had ${this.badAspectCasts} bad cast(s) of Aspect of the Wild. <ul><li>Bad casts indicate that Aspect of the Wild was cast without Bestial Wrath up with atleast 7 seconds remaining. (The only exception is if the fight is about to end in which you just cast Aspect of the Wild)</li></ul></li></ul>` : ``;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ASPECT_OF_THE_WILD.id} />}
        value={(
          <span>
            {this.goodAspectCasts}{'  '}
            <SpellIcon
              id={SPELLS.ASPECT_OF_THE_WILD.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {'  '}
            {this.badAspectCasts}{'  '}
            <SpellIcon
              id={SPELLS.ASPECT_OF_THE_WILD.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
                filter: 'grayscale(100%)',
              }}
            />
          </span>

        )}
        label={`Aspect of the Wild`}
        tooltip={tooltipText}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(8);

}

export default AspectOfTheWild;
