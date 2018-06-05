import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Abilities from 'Parser/Core/Modules/Abilities';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const HEALTHSTONE_SPELLS = [
  SPELLS.HEALTHSTONE,
  SPELLS.ANCIENT_HEALING_POTION,
  SPELLS.ASTRAL_HEALING_POTION,
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
  };

  maxCasts = 1;

  on_initialized() {
    this.abilities.add({
      spell: HEALTHSTONE_SPELLS,
      category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      cooldown: ONE_HOUR_MS / 1000, // The cooldown does not start while in combat so setting it to one hour.
      castEfficiency: {
        suggestion: true,
        maxCasts: (cooldown, fightDuration, getAbility, parser) => {
          return this.maxCasts;
        },
      },
    });
  }

  on_toPlayer_death(event) {
    if (!this.spellUsable.isOnCooldown(SPELLS.HEALTHSTONE.id)){
      return;
    }
    const cooldownRemaining = this.spellUsable.cooldownRemaining(SPELLS.HEALTHSTONE.id);
    // Only start cooldown if not already started.
    if (cooldownRemaining < COOLDOWN_MS){
      return;
    }
    this.spellUsable.reduceCooldown(SPELLS.HEALTHSTONE.id, cooldownRemaining - COOLDOWN_MS);
    // If the death starts the cooldown and there is less than 60 seconds remaining of the encounter another cast was possible.
    const nextAvailableHealthstoneCast = event.timestamp + COOLDOWN_MS;
    if(nextAvailableHealthstoneCast < this.owner.fight.end_time){
      this.maxCasts += 1;
    }
  }

}

export default Healthstone;
