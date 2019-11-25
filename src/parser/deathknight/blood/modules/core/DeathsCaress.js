import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const RANGE_WHERE_YOU_SHOULDNT_DC = 12; // yrd

class DeathsCaress extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  dcCasts = 0;
  cast = [];

  spellsThatShouldBeUsedFirst = [
    SPELLS.DEATH_AND_DECAY.id,
  ];

  constructor(...args) {
    super(...args);
    if(this.selectedCombatant.hasTalent(SPELLS.BLOODDRINKER_TALENT.id)) {
      this.spellsThatShouldBeUsedFirst.push(SPELLS.BLOODDRINKER_TALENT.id);
    }
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.DEATHS_CARESS.id) {
      return;
    }

    const hadAnotherRangedSpell = this.spellsThatShouldBeUsedFirst.some(e => this.spellUsable.isAvailable(e));
    this.dcCasts += 1;

    this.cast.push({
      timestamp: event.timestamp,
      hadAnotherRangedSpell: hadAnotherRangedSpell,
      playerPosition: {
        x: event.x,
        y: event.y,
      },
      enemyPosition: {
        x: 0,
        y: 0,
      },
    });
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.DEATHS_CARESS.id || this.cast.length === 0) {
      return;
    }

    this.cast[this.cast.length - 1].enemyPosition = {
      x: event.x,
      y: event.y,
    };
  }

  calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) / 100;
  }

  get badDcCasts() {
    let badCasts = 0;

    this.cast.forEach(e => {
      //only happens when the target died before the damage event occurs
      if (e.enemyPosition.x === 0 && e.enemyPosition.y === 0) {
        return;
      }

      const distance = this.calculateDistance(e.enemyPosition.x, e.enemyPosition.y, e.playerPosition.x, e.playerPosition.y);
      if (distance <= RANGE_WHERE_YOU_SHOULDNT_DC || e.hadAnotherRangedSpell) { // close to melee-range => bad || when another ranged spell was available
        badCasts += 1;
      }
    });

    return badCasts;
  }

  get averageCastSuggestionThresholds() {
    return {
      actual: 1 - (this.badDcCasts / this.dcCasts),
      isLessThan: {
        minor: 1,
        average: .95,
        major: .9,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.averageCastSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<>Avoid casting <SpellLink id={SPELLS.DEATHS_CARESS.id} /> unless you're out of melee range and about to cap your runes while <SpellLink id={SPELLS.DEATH_AND_DECAY.id} /> and <SpellLink id={SPELLS.BLOODDRINKER_TALENT.id} /> are on cooldown. Dump runes primarily with <SpellLink id={SPELLS.HEART_STRIKE.id} />.</>)
            .icon(SPELLS.DEATHS_CARESS.icon)
            .actual(`${formatPercentage(this.badDcCasts / this.dcCasts)}% bad ${SPELLS.DEATHS_CARESS.name} casts`)
            .recommended(`0% are recommended`);
        });
  }
}

export default DeathsCaress;
