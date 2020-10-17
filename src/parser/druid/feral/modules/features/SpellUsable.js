import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';

import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';

import { RAKE_BASE_DURATION, THRASH_FERAL_BASE_DURATION, PANDEMIC_FRACTION } from '../../constants';

const EARLY_BLEED_EXPIRE_TO_COUNT_AS_DEATH = 500;
const BLEED_BASE_DURATIONS = {
  [SPELLS.RAKE.id]: RAKE_BASE_DURATION,
  //[SPELLS.RIP.id]: RIP_BASE_DURATION,
  [SPELLS.THRASH_FERAL.id]: THRASH_FERAL_BASE_DURATION,
};
const BLEED_SPELLS = [SPELLS.RAKE, SPELLS.THRASH_FERAL];

/**
 * Predator:
 * The cooldown on Tiger's Fury resets when a target dies with one of your Bleed effects active
 *
 * We cannot directly detect enemy death, but can infer it from a bleed debuff ending early.
 * Death is not the only cause of a bleed ending early, for instance a Monk's paralysis ability
 * removes DoTs when it's applied to a target.
 * We know for certain that an enemy died when Tiger's Fury is used earlier than should be possible.
 * When that happens assume the most recent possible enemy death was when the cooldown reset.
 *
 * TODO: Since 8.1 the duration of Rip is more complex. It can be extended by Sabertooth, its initial
 * duration will vary depending on combo points, and it can be applied to multiple targets by Primal Wrath.
 * Currently none of this is handled here, so tracking Rip has been disabled.
 */
class SpellUsable extends CoreSpellUsable {
  earlyCastsOfTigersFury = 0;

  // e.g. activeBleedsExpire[targetString][SPELLS.RAKE.id] = timestamp
  activeBleedsExpire = {};
  hasPredator = null;

  // timestamp of most recent possible kill event
  possibleRecentKill = null;

  constructor(...args) {
    super(...args);
    this.hasPredator = this.selectedCombatant.hasTalent(SPELLS.PREDATOR_TALENT.id);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(BLEED_SPELLS), this.onApplyDebuff);
    this.addEventListener(Events.refreshdebuff.by(SELECTED_PLAYER).spell(BLEED_SPELLS), this.onRefreshDebuff);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(BLEED_SPELLS), this.onRemoveDebuff);
  }

  onApplyDebuff(event) {
    const spellId = event.ability.guid;
    if (!this.hasPredator) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.activeBleedsExpire[target]) {
      this.activeBleedsExpire[target] = {};
    }
    const duration = BLEED_BASE_DURATIONS[spellId];
    this.activeBleedsExpire[target][spellId] = event.timestamp + duration;
  }

  onRefreshDebuff(event) {
    const spellId = event.ability.guid;
    if (!this.hasPredator) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.activeBleedsExpire[target]) {
      this.activeBleedsExpire[target] = {};
    }
    // existingExpire may be null if combat log missed the original applydebuff
    const existingExpire = this.activeBleedsExpire[target][spellId];
    const remainingOnPrevious = Math.max(0, existingExpire ? (existingExpire - event.timestamp) : 0);
    const durationWithoutPandemic = BLEED_BASE_DURATIONS[spellId];
    const pandemic = Math.min(durationWithoutPandemic * PANDEMIC_FRACTION, remainingOnPrevious);
    this.activeBleedsExpire[target][spellId] = event.timestamp + durationWithoutPandemic + pandemic;
  }

  onRemoveDebuff(event) {
    const spellId = event.ability.guid;
    if (!this.hasPredator) {
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

  beginCooldown(spellId, cooldownTriggerEvent) {
    if (SPELLS.TIGERS_FURY.id === spellId &&
        this.hasPredator && this.isOnCooldown(spellId)) {
      const resetTime = this.possibleRecentKill ? this.possibleRecentKill : cooldownTriggerEvent.timestamp;
      this.earlyCastsOfTigersFury += 1;
      this.endCooldown(spellId, false, resetTime);
    }
    super.beginCooldown(spellId, cooldownTriggerEvent);
  }
}

export default SpellUsable;
