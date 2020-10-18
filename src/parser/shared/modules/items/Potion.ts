import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Spell from 'common/SPELLS/Spell';
import Events, { DeathEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';

const ONE_HOUR_MS = 3600000; // one hour
const COOLDOWN_MS = 60000; // one minute

/**
 * Abstract class for potions and healthstone.
 * There are three different categories of pots that share cooldown:
 * Healthstones, health pots and combat pots (DPS, HPS, mana and mitigation).
 * pot cooldown is one minute, but the cooldown does not start until the
 * actor is out of combat or dead.
 *
 * @property {Abilities} abilities
 * @property {Buffs} buffs
 * @property {SpellUsable} spellUsable
 * @property {AbilityTracker} abilityTracker
 */
class Potion extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    buffs: Buffs,
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };

  protected abilities!: Abilities;
  protected buffs!: Buffs;
  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;

  static spells: Spell[];
  static recommendedEfficiency: number;
  static extraAbilityInfo: {name?: string, buffSpellId?: number[], isDefensive?: boolean,};

  maxCasts = 1;
  lastDeathWithPotionReady?: number;

  get static(){
    return this.constructor as typeof Potion;
  }

  constructor(options: Options) {
    super(options);
    if (!this.isAvailable) {
      this.active = false;
      return;
    }
    (options.abilities as Abilities).add({
      spell: this.static.spells,
      category: Abilities.SPELL_CATEGORIES.CONSUMABLE,
      cooldown: (_, cooldownTriggerEvent) => {
        if (cooldownTriggerEvent && cooldownTriggerEvent.prepull) {
          return 60;
        }

        // The cooldown does not start while in combat so setting it to one hour.
        return ONE_HOUR_MS / 1000;
      },
      castEfficiency: {
        suggestion: false,
        maxCasts: () => this.maxCasts,
      },
      ...this.static.extraAbilityInfo,
    });
    if (this.static.extraAbilityInfo.buffSpellId) {
      //assign each buff its corresponding spell ID
      this.static.extraAbilityInfo.buffSpellId.forEach((buff, buffIndex) => {
        (options.buffs as Buffs).add({
          spellId: buff,
          triggeredBySpellId: this.static.spells.find((_, spellIndex) => spellIndex === buffIndex)!.id,
        });
      });
    }

    this.addEventListener(Events.death.to(SELECTED_PLAYER), this.onDeath);
  }

  // To be overwriten by classes extending the Potion module.
  get isAvailable() {
    return true;
  }

  get spellId() {
    const spells = this.static.spells;
    const ability = this.abilities.getAbility(spells[0].id)!;
    return ability.primarySpell.id;
  }

  onDeath(event: DeathEvent) {
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

  increaseMaxCasts(event: DeathEvent) {
    // If the death starts the cooldown and there is more than 60 seconds remaining of the encounter another cast was possible.
    const nextAvailablePotionCast = event.timestamp + COOLDOWN_MS;
    if (nextAvailablePotionCast < this.owner.fight.end_time) {
      this.maxCasts += 1;
    }
  }

  get potionCasts() {
    return this.abilityTracker.getAbility(this.spellId).casts;
  }

  get suggestionThresholds() {
    return {
      actual: this.potionCasts / this.maxCasts,
      isLessThan: {
        minor: this.static.recommendedEfficiency,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default Potion;
