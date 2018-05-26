import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox from 'Main/StatisticBox';
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

//Duration of Bestial Wrath
const BESTIAL_WRATH_DURATION = 15000;

//You generally use aspect of the wild if you have more than 7 seconds remaining in bestial wrath
const BESTIAL_WRATH_REMAINING_USE_ASPECT = 7000;

//remaining time in combat where you just use AotW regardless
const FIGHT_ENDING_USE_ASPECT = 15000;

//allows early usage of AotW
const USE_BEFORE_BW = 3000;

/**
 * Grants you and your pet 10 Focus per 1 sec and 10% increased critical strike chance on all attacks for 10 sec.
 * Reduces GCD for the duration by 0.2seconds baseline.
 */
class AspectOfTheWild extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
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
      if ((this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id) && event.timestamp < (this.bestialWrathEnd - BESTIAL_WRATH_REMAINING_USE_ASPECT)) || !this.spellUsable.isOnCooldown(SPELLS.BESTIAL_WRATH.id) || (this.spellUsable.isOnCooldown(SPELLS.BESTIAL_WRATH.id) && this.spellUsable.cooldownRemaining(SPELLS.BESTIAL_WRATH.id) < USE_BEFORE_BW)) {
        this.goodAspectCasts += 1;
      } else {
        this.badAspectCasts += 1;
        this.lastAspectCastTime = event.timestamp;
      }
    }
  }

  on_finished() {
    if (this.lastAspectCastTime > (this.owner.fight.end_time - FIGHT_ENDING_USE_ASPECT) && this.badAspectCasts > 0) {
      this.badAspectCasts -= 1;
      this.goodAspectCasts += 1;
    }
  }

  get badCastThreshold() {
    return {
      actual: this.badAspectCasts,
      isGreaterThan: {
        minor: 0,
        average: 0.9,
        major: 1.9,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.badCastThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Don't cast <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} /> without <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> up and atleast 7 seconds remaining on the buff (or with under than 15 seconds remaining of the encounter) </React.Fragment>)
        .icon(SPELLS.ASPECT_OF_THE_WILD.icon)
        .actual(`You cast Aspect of the Wild ${this.badAspectCasts} times without Bestial Wrath up or with less than 7s remaining of Bestial Wrath duration`)
        .recommended(`${recommended} is recommended`);
    });
  }
  statistic() {
    let tooltipText = `You cast Aspect of the Wild a total of ${this.totalAspectCasts} times.`;
    tooltipText += this.badAspectCasts > 0 ? `<ul><li>You had ${this.badAspectCasts} bad cast(s) of Aspect of the Wild. <ul><li>Bad casts indicate that Aspect of the Wild was cast without Bestial Wrath up with atleast 7 seconds remaining, or without having Bestial Wrath off cooldown (or within 3 seconds of coming off cooldown)<li> (The only exception is if the fight is about to end in which case you just cast Aspect of the Wild)</li></li></ul></li></ul>` : ``;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ASPECT_OF_THE_WILD.id} />}
        value={(
          <React.Fragment>
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
          </React.Fragment>

        )}
        label="Aspect of the Wild"
        tooltip={tooltipText}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(8);

}

export default AspectOfTheWild;
