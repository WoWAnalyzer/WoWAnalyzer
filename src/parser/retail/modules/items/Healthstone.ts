import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { Class, DeathEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';

import Potion from './Potion';
import { TALENTS_WARLOCK } from 'common/TALENTS';

const ONE_HOUR_MS = 3600000; // one hour
const COOLDOWN_MS = 60000; // one minute

/**
 * Tracks Healthstone cooldown.
 */
class Healthstone extends Potion {
  static dependencies = {
    ...Potion.dependencies,
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  static spells = [SPELLS.HEALTHSTONE.id, SPELLS.DEMONIC_HEALTHSTONE.id];
  static recommendedEfficiency = 0;
  static extraAbilityInfo = {
    isDefensive: true,
  };
  static cooldown = ONE_HOUR_MS / 1000;

  lastDeathWithHealthstoneReady?: number;

  constructor(options: Options) {
    super(options);
    this.active = this.hasWarlock(options.combatants as Combatants);
    this.addEventListener(Events.death.to(SELECTED_PLAYER), this.onDeath);
    this.maxCasts = this.selectedCombatant.hasTalent(TALENTS_WARLOCK.PACT_OF_GLUTTONY_TALENT)
      ? 3
      : 1;
  }

  protected hasWarlock(combatants: Combatants) {
    const players = Object.values(combatants.players);
    return players.some((combatant) => combatant.player.type === Class.Warlock);
  }

  protected shouldActivate(options: Options) {
    return this.hasWarlock(options.combatants as Combatants);
  }

  onDeath(event: DeathEvent) {
    if (!this.spellUsable.isOnCooldown(this.spellId)) {
      // If the healthstone was not on cooldown, only increase maxCasts if it would have been ready again since the previous death.
      if (this.lastDeathWithHealthstoneReady) {
        const timeSince = event.timestamp - this.lastDeathWithHealthstoneReady;
        if (timeSince < COOLDOWN_MS) {
          // The healthstone would not have been ready if used on previous death
          return;
        }
      }
      // The healthstone was ready for this death so increase maxCasts and save timestamp
      this.lastDeathWithHealthstoneReady = event.timestamp;
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
}

export default Healthstone;
