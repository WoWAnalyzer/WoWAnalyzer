import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import Abilities from 'Parser/Core/Modules/Abilities';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

const HEALTHSTONE_SPELLS = [
  SPELLS.HEALTHSTONE,
  SPELLS.ANCIENT_HEALING_POTION,
  SPELLS.ASTRAL_HEALING_POTION,
];

const HEALTHSTONE_IDS = [
  SPELLS.HEALTHSTONE.id,
  SPELLS.ANCIENT_HEALING_POTION.id,
  SPELLS.ASTRAL_HEALING_POTION.id,
];

const ONE_HOUR_MS = 3600000; // one hour
const COOLDOWN_MS = 60000; // one minute

/**
* Healthstone/health pot cooldown is one minute, but only starts when the 
* actor is out of combat or dead.
*/

class Healthstone extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };

  maxCasts = 1;
  casts = 0;
  lastDeathWithHealthstoneReady = null;

  constructor(...args) {
    super(...args);
    this.abilities.add({
      spell: HEALTHSTONE_SPELLS,
      category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      cooldown: ONE_HOUR_MS / 1000, // The cooldown does not start while in combat so setting it to one hour.
      castEfficiency: {
        suggestion: false,
        recommendedEfficiency: 0.6,
        importance: ISSUE_IMPORTANCE.MINOR,
        maxCasts: (cooldown, fightDuration, getAbility, parser) => {
          return this.maxCasts;
        },
      },
    });
  }

  on_toPlayer_death(event) {
    if (!this.spellUsable.isOnCooldown(SPELLS.HEALTHSTONE.id)){
      // If Healthstone was not on cooldown, only increase maxCasts if it would have been ready again since the previous death.
      if (this.lastDeathWithHealthstoneReady){
        const timeSince = event.timestamp - this.lastDeathWithHealthstoneReady;
        if (timeSince < COOLDOWN_MS){ // Healthstone would not have been ready if used on previous death
          return;
        }
      }
      // Healthstone was ready for this death so increase maxCasts and save timestamp
      this.lastDeathWithHealthstoneReady = event.timestamp;
      this.increaseMaxCasts(event);
      return;
    }
    const cooldownRemaining = this.spellUsable.cooldownRemaining(SPELLS.HEALTHSTONE.id);
    // Only start cooldown if not already started.
    if (cooldownRemaining < COOLDOWN_MS){
      return;
    }
    this.spellUsable.reduceCooldown(SPELLS.HEALTHSTONE.id, cooldownRemaining - COOLDOWN_MS);
    this.increaseMaxCasts(event);
  }

  increaseMaxCasts(event){
    // If the death starts the cooldown and there is less than 60 seconds remaining of the encounter another cast was possible.
    const nextAvailableHealthstoneCast = event.timestamp + COOLDOWN_MS;
    if (nextAvailableHealthstoneCast < this.owner.fight.end_time){
      this.maxCasts += 1;
    }
  }

  get healthstoneCasts() {
    HEALTHSTONE_IDS.forEach(spell => {
      this.casts += this.abilityTracker.getAbility(spell).casts || 0;
    });
    return this.casts;
  }

  get suggestionThresholds() {
    return {
      actual: this.healthstoneCasts,
      isLessThan: {
        minor: this.maxCasts,
      },
      style: 'number',
    };
  }

  suggestions(when) {
		when(this.suggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<React.Fragment>You used a <SpellLink id={SPELLS.HEALTHSTONE.id} /> or Healing Potion {this.healthstoneCasts} times but could have used it {this.maxCasts > 1 ? this.maxCasts + ' time' : this.maxCasts + ' times'}. If you are low on health, make sure you use your Healthstones, Healing Potions, and Defensive Abilities to stay alive and to help the healers. </React.Fragment>)
					.icon(SPELLS.HEALTHSTONE.icon);
      });
  }
}

export default Healthstone;
