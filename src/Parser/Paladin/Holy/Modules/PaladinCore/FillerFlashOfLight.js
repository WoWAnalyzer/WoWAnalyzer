import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import AbilityTracker from './PaladinAbilityTracker';

/** @type {number} (ms) When Holy Shock has less than this as cooldown remaining you should wait and still not cast that filler FoL. */
const HOLY_SHOCK_COOLDOWN_WAIT_TIME = 200;

/**
 * First there was a check that you shouldn't cast a filler FoL when HS is ready because it is inefficient because HS is that much more efficient a spell (see the statistics in the Holy Paladin spreadsheet). I figured that waiting a fraction of a second for HS to become available would have the same result.
 *
 * The question is how much of a fraction of a second? I am fairly confident feelycrafting that waiting 200ms is more efficient, and I think up to 300ms is also going to be more efficient, maybe a bit further but hard to say.
 *
 * So then the question is what is a reasonable amount to ask of a player? I think 200ms is an amount that is very hard to differentiate from a spell just coming off cooldown. It's a delay similar to latency during raid fights. Spamming HS while its icon is as good as off cooldown would be the best course of action here and not take any uber skills form the player. So I reckon it's reasonable to include casts as being inefficient casts at this interval.
 */
class FillerFlashOfLight extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  inefficientCasts = [];
  on_byPlayer_begincast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FLASH_OF_LIGHT.id) {
      return;
    }
    // If there is a lot of healing to be done in short window of time using your IoL proc before casting HS makes sense.
    // The `-1` buffer time is to properly handle chain-casting and IoL buffs; when chain casting the first FoL will consume the IoL buff on the `cast` event and that exact same frame will have the `begincast` event. Because `hasBuff` looks at the timestamp rather than event order, it would otherwise include the buff.
    const hasIol = this.combatants.selected.hasBuff(SPELLS.INFUSION_OF_LIGHT.id, event.timestamp, -1);
    if (hasIol) {
      return;
    }

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

  get inefficientCpm() {
    return this.inefficientCasts.length / (this.owner.fightDuration / 1000) * 60;
  }

  get suggestionThresholds() {
    return {
      actual: this.inefficientCasts.length,
      isGreaterThan: {
        minor: 0,
        average: 0.25 * this.owner.fightDuration / 1000 / 60,
        major: 0.5 * this.owner.fightDuration / 1000 / 60,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual) => {
      return suggest(
        <Wrapper>
          You started casting {this.inefficientCasts.length} filler <SpellLink id={SPELLS.FLASH_OF_LIGHT.id} icon />s while <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} icon /> was <dfn data-tip={`It was either already available or going to be available within ${HOLY_SHOCK_COOLDOWN_WAIT_TIME}ms.`}>available</dfn> (at {this.inefficientCasts.map(event => this.owner.formatTimestamp(event.timestamp)).join(', ')}). <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} icon /> is a much more efficient spell and should be prioritized<dfn data-tip="There are very rare exceptions to this. For example it may be worth saving Holy Shock when you know you're going to be moving soon and you may have to heal yourself.">*</dfn>.
        </Wrapper>
      )
        .icon(SPELLS.FLASH_OF_LIGHT.icon)
        .actual(`${this.inefficientCasts.length} casts while Holy Shock was available`)
        .recommended(`No inefficient casts is recommended`);
    });
  }
}

export default FillerFlashOfLight;
