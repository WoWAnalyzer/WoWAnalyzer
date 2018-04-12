import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import React from 'react';
import Wrapper from 'common/Wrapper';
import SixStackBites from 'Parser/Hunter/Survival/Modules/Features/MongooseFury/SixStackBites';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

//Aspect of the Eagle lasts 10 seconds, but to allow for the player to have a bit of leeway, we'll allow down to 9 seconds remaining on Mongoose Fury for it to count as a good usage
const MINIMUM_TIME_REMAINING = 9000;

/**
 * Grants you and your pet 10% increased Critical Strike chance on all abilities,
 * and your pet's attacks have an additional 25% chance to grant you a charge of
 * Mongoose Bite. Lasts 10 sec.
 */
class AspectOfTheEagle extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    sixStackBites: SixStackBites,
  };

  aspectCasts = 0;
  badAspectCasts = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ASPECT_OF_THE_EAGLE.id) {
      return;
    }
    this.aspectCasts++;
    if (!this.combatants.selected.hasBuff(SPELLS.MONGOOSE_FURY.id) || this.sixStackBites.mongooseFuryEndTimestamp < event.timestamp + MINIMUM_TIME_REMAINING) {
      this.badAspectCasts++;
    }
  }

  get badAspectCastsPercentage() {
    return this.badAspectCasts / this.aspectCasts;
  }
  get badAspectCastsThreshold() {
    return {
      actual: this.badAspectCasts,
      isLessThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.badAspectCastsThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>You cast <SpellLink id={SPELLS.ASPECT_OF_THE_EAGLE.id} /> {this.badAspectCasts} {this.badAspectCasts > 1 ? 'times' : 'time'} without <SpellLink id={SPELLS.MONGOOSE_FURY.id} /> up or with less than {MINIMUM_TIME_REMAINING / 1000} seconds remaining, and thus not utilising the full duration of <SpellLink id={SPELLS.ASPECT_OF_THE_EAGLE.id} /> (and by extension <SpellLink id={SPELLS.ASPECT_OF_THE_SKYLORD_BUFF.id} />) inside a <SpellLink id={SPELLS.MONGOOSE_FURY.id} /> window. </Wrapper>)
        .icon(SPELLS.ASPECT_OF_THE_EAGLE.icon)
        .actual(`${formatPercentage(actual)}% of casts were bad`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }
}

export default AspectOfTheEagle;
