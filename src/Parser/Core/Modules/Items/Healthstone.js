import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Abilities from 'Parser/Core/Modules/Abilities';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const HEALTHSTONE_SPELLS = [
  SPELLS.HEALTHSTONE,
  SPELLS.ANCIENT_HEALING_POTION,
  SPELLS.ASTRAL_HEALING_POTION,
];

const COOLDOWN_MS = 3600000; // one hour
const OUT_OF_COMBAT_COOLDOWN_MS = 60000; // one minute

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
      cooldown: COOLDOWN_MS / 1000, // The cooldown does not start while in combat.
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
    //only start cooldown if not already started.
    if (cooldownRemaining < OUT_OF_COMBAT_COOLDOWN_MS){
      return;
    }
    this.spellUsable.reduceCooldown(SPELLS.HEALTHSTONE.id, cooldownRemaining - OUT_OF_COMBAT_COOLDOWN_MS);
    if(event.timestamp + OUT_OF_COMBAT_COOLDOWN_MS < this.owner.fight.end_time){
      this.maxCasts += 1;
    }
  }

}

export default Healthstone;
