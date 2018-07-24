import Analyzer from 'Parser/Core/Analyzer';
import Abilities from 'Parser/Core/Modules/Abilities';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const ONE_HOUR_MS = 3600000; // one hour
const COOLDOWN_MS = 60000; // one minute

/**
 * Abstract class for potions and healthstone. 
 * There are three different categories of pots that share cooldown:
 * Healthstones, health pots and combat pots (DPS, HPS, mana and mitigation).
 * pot cooldown is one minute, but the cooldown does not start until the
 * actor is out of combat or dead.
 * args[3] = spell
 * args[4] = recommendedEfficiency
 */

class Potion extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };

  spells = null;
  efficiency = 0;
  maxCasts = 1;
  lastDeathWithPotionReady = null;

  constructor(...args) {
    super(...args);
    this.spells = args[3];
    this.efficiency = args[4];
    this.abilities.add({
      spell: this.spells,
      category: Abilities.SPELL_CATEGORIES.CONSUMABLE,
      cooldown: ONE_HOUR_MS / 1000, // The cooldown does not start while in combat so setting it to one hour.
      castEfficiency: {
        suggestion: false,
        maxCasts: (cooldown, fightDuration, getAbility, parser) => {
          return this.maxCasts;
        },
      },
    });
  }

  get spellId() {
    return this.spells[0] ? this.abilities.getAbility(this.spells[0].id).primarySpell.id : this.abilities.getAbility(this.spells.id).primarySpell.id;
  }

  on_toPlayer_death(event) {
    if (!this.spellUsable.isOnCooldown(this.spellId)) {
      // If the potion was not on cooldown, only increase maxCasts if it would have been ready again since the previous death.
      if (this.lastDeathWithPotionReady) {
        const timeSince = event.timestamp - this.lastDeathWithPotionReady;
        if (timeSince < COOLDOWN_MS) { // The potion would not have been ready if used on previous death
          return;
        }
      }
      // The potion was ready for this death so increase maxCasts and save timestamp
      this.lastDeathWithPotionReady = event.timestamp;
      this.increaseMaxCasts(event);
      return;
    }
    const cooldownRemaining = this.spellUsable.cooldownRemaining(this.spellId);
    // Only start cooldown if not already started.
    if (cooldownRemaining < COOLDOWN_MS) {
      return;
    }
    this.spellUsable.reduceCooldown(this.spellId, cooldownRemaining - COOLDOWN_MS);
    this.increaseMaxCasts(event);
  }

  increaseMaxCasts(event) {
    // If the death starts the cooldown and there is less than 60 seconds remaining of the encounter another cast was possible.
    const nextAvailablePotionCast = event.timestamp + COOLDOWN_MS;
    if (nextAvailablePotionCast < this.owner.fight.end_time) {
      this.maxCasts += 1;
    }
  }

  get potionCasts() {
    return this.abilityTracker.getAbility(this.spellId).casts || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.potionCasts / this.maxCasts,
      isLessThan: {
        minor: this.efficiency,
      },
      style: 'percent',
    };
  }
}

export default Potion;
