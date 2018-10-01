import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/core/modules/SpellUsable';

import AbilityTracker from './PaladinAbilityTracker';

/** @type {number} (ms) When Holy Shock has less than this as cooldown remaining you should wait and still not cast that filler FoL. */
const HOLY_SHOCK_COOLDOWN_WAIT_TIME = 200;

class FillerLightOfTheMartyrs extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  casts = 0;
  inefficientCasts = [];
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_THE_MARTYR.id) {
      return;
    }

    this.casts += 1;

    const hasHolyShockAvailable = this.spellUsable.isAvailable(SPELLS.HOLY_SHOCK_CAST.id);
    if (!hasHolyShockAvailable) {
      // We can't cast it, but check how long until it comes off cooldown. We should wait instead of casting a filler if it becomes available really soon.
      const cooldownRemaining = this.spellUsable.cooldownRemaining(SPELLS.HOLY_SHOCK_CAST.id);
      if (cooldownRemaining > HOLY_SHOCK_COOLDOWN_WAIT_TIME) {
        return;
      }
    }
    this.inefficientCasts.push(event);
  }

  get cpm() {
    return this.casts / (this.owner.fightDuration / 1000) * 60;
  }
  get inefficientCpm() {
    return this.inefficientCasts.length / (this.owner.fightDuration / 1000) * 60;
  }

  get cpmSuggestionThresholds() {
    return {
      actual: this.cpm,
      isGreaterThan: {
        minor: 1.5,
        average: 2,
        major: 3,
      },
      style: 'number',
    };
  }
  get inefficientCpmSuggestionThresholds() {
    return {
      actual: this.inefficientCpm,
      isGreaterThan: {
        minor: 0,
        average: 0.25,
        major: 0.5,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.cpmSuggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest((
        <React.Fragment>
          You cast many <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} />s. Light of the Martyr is an inefficient spell to cast, try to only cast Light of the Martyr when it will save someone's life or when moving and all other instant cast spells are on cooldown.
        </React.Fragment>
      ))
        .icon(SPELLS.LIGHT_OF_THE_MARTYR.icon)
        .actual(`${this.cpm.toFixed(2)} Casts Per Minute - ${this.casts} casts total`)
        .recommended(`<${recommended} Casts Per Minute is recommended`);
    });

    when(this.inefficientCpmSuggestionThresholds).addSuggestion((suggest, actual) => {
      return suggest(
        <React.Fragment>
          You cast {this.inefficientCasts.length} <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} />s while <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> was <dfn data-tip={`It was either already available or going to be available within ${HOLY_SHOCK_COOLDOWN_WAIT_TIME}ms.`}>available</dfn> (at {this.inefficientCasts.map(event => this.owner.formatTimestamp(event.timestamp)).join(', ')}). Try to <b>never</b> cast <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> when something else is available<dfn data-tip="There are very rare exceptions to this. For example it may be worth saving Holy Shock when you know you're going to be moving soon and you may have to heal yourself.">*</dfn>.
        </React.Fragment>
      )
        .icon(SPELLS.LIGHT_OF_THE_MARTYR.icon)
        .actual(`${this.inefficientCasts.length} casts while Holy Shock was available`)
        .recommended(`No inefficient casts is recommended`);
    });
  }
}

export default FillerLightOfTheMartyrs;
