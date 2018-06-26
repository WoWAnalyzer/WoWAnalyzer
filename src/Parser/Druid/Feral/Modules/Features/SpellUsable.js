import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';
import Combatants from 'Parser/Core/Modules/Combatants';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';
import { RAKE_BASE_DURATION, RIP_BASE_DURATION, THRASH_FERAL_BASE_DURATION, JAGGED_WOUNDS_MODIFIER, PANDEMIC_FRACTION } from '../../Constants';

const EARLY_BLEED_EXPIRE_TO_COUNT_AS_DEATH = 500;
const BLEED_BASE_DURATIONS = {
  [SPELLS.RAKE.id]: RAKE_BASE_DURATION,
  [SPELLS.RIP.id]: RIP_BASE_DURATION,
  [SPELLS.THRASH_FERAL.id]: THRASH_FERAL_BASE_DURATION,
};

/**
 * Predator:
 * The cooldown on Tiger's Fury resets when a target dies with one of your Bleed effects active
 * 
 * We cannot directly detect enemy death, but can infer it from a bleed debuff ending early.
 * Death is not the only cause of a bleed ending early, for instance a Monk's paralysis ability
 * removes DoTs when it's applied to a target.
 * We know for certain that an enemy died when Tiger's Fury is used earlier than should be possible.
 * When that happens assume the most recent possible enemy death was when the cooldown reset.
 */
class SpellUsable extends CoreSpellUsable {
  // BFA: replace this.combatants.selected with this.selectedCombatant, and remove combatants dependency
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    combatants: Combatants,
  };

  earlyCastsOfTigersFury = 0;

  // e.g. activeBleedsExpire[targetString][SPELLS.RAKE.id] = timestamp
  activeBleedsExpire = {};
  hasPredator = null;
  hasJaggedWounds = null;

  // timestamp of most recent possible kill event
  possibleRecentKill = null;

  // BFA: replace with constructor (and use this.selectedCombatant)
  on_initialized() {
    if (super.on_initialized) {
      super.on_initialized();
    }
    this.hasPredator = this.combatants.selected.hasTalent(SPELLS.PREDATOR_TALENT.id);
    this.hasJaggedWounds = this.combatants.selected.hasTalent(SPELLS.JAGGED_WOUNDS_TALENT.id);
  }

  on_byPlayer_applydebuff(event) {
    if (super.on_byPlayer_applydebuff) {
      super.on_byPlayer_applydebuff(event);
    }
    const spellId = event.ability.guid;
    if (!this.hasPredator || !this.isBleed(spellId)) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.activeBleedsExpire[target]) {
      this.activeBleedsExpire[target] = {};
    }
    const duration = BLEED_BASE_DURATIONS[spellId] * (this.hasJaggedWounds ? JAGGED_WOUNDS_MODIFIER : 1);
    this.activeBleedsExpire[target][spellId] = event.timestamp + duration;
  }

  on_byPlayer_refreshdebuff(event) {
    if (super.on_byPlayer_refreshdebuff) {
      super.on_byPlayer_refreshdebuff(event);
    }
    const spellId = event.ability.guid;
    if (!this.hasPredator || !this.isBleed(spellId)) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.activeBleedsExpire[target]) {
      this.activeBleedsExpire[target] = {};
    }
    // existingExpire may be null if combat log missed the original applydebuff
    const existingExpire = this.activeBleedsExpire[target][spellId];
    const remainingOnPrevious = Math.max(0, existingExpire ? (existingExpire - event.timestamp) : 0);
    const durationWithoutPandemic = BLEED_BASE_DURATIONS[spellId] * (this.hasJaggedWounds ? JAGGED_WOUNDS_MODIFIER : 1);
    const pandemic = Math.min(durationWithoutPandemic * PANDEMIC_FRACTION, remainingOnPrevious);
    this.activeBleedsExpire[target][spellId] = event.timestamp + durationWithoutPandemic + pandemic;
  }

  on_byPlayer_removedebuff(event) {
    if (super.on_byPlayer_removedebuff) {
      super.on_byPlayer_removedebuff(event);
    }
    const spellId = event.ability.guid;
    if (!this.hasPredator || !this.isBleed(spellId)) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.activeBleedsExpire[target]) {
      this.activeBleedsExpire[target] = {};
    }
    const expire = this.activeBleedsExpire[target][spellId];
    const beforeExpire = expire ? (expire - event.timestamp) : 0;
    if (beforeExpire > EARLY_BLEED_EXPIRE_TO_COUNT_AS_DEATH) {
      this.possibleRecentKill = event.timestamp;
    }
  }

  isBleed(spellId) {
    return !!Object.keys(BLEED_BASE_DURATIONS).includes(spellId.toString());
  }

  beginCooldown(spellId, timestamp) {
    if (SPELLS.TIGERS_FURY.id === spellId &&
        this.hasPredator && this.isOnCooldown(spellId)) {
      const resetTime = this.possibleRecentKill ? this.possibleRecentKill : timestamp;
      this.earlyCastsOfTigersFury += 1;
      this.endCooldown(spellId, null, resetTime);
    }
    super.beginCooldown(spellId, timestamp);
  }
}

export default SpellUsable;
