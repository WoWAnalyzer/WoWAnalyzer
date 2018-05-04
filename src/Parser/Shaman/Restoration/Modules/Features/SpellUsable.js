import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';
import Abilities from '../Abilities';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    combatants: Combatants,
    abilities: Abilities,
  };

  on_initialized() {
    this.hasEcho = this.combatants.selected.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id);
  }

  on_dispel(event) {
    if (!this.owner.byPlayer(event)) {
      return;
    }

    const spellId = event.ability.guid;
    if (spellId === SPELLS.PURIFY_SPIRIT.id) {
      super.beginCooldown(spellId, event.timestamp);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DOWNPOUR_TALENT.id) {
      this.extendCooldown(spellId, this.abilities.getExpectedCooldownDuration(SPELLS.DOWNPOUR_TALENT.id));
      return;
    }

    super.on_byPlayer_cast(event);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DOWNPOUR_TALENT.id || !event.amount) {
      return;
    }

    // begin cooldown if not on cd
    // extend by 5 seconds if it is on cd
    this.extendCooldown(spellId, this.abilities.getExpectedCooldownDuration(SPELLS.DOWNPOUR_TALENT.id));
  }

  beginCooldown(spellId, timestamp) {
    if (this.hasEcho && spellId === SPELLS.RIPTIDE.id) {
      if (!this.isAvailable(spellId)) {
        this.endCooldown(spellId);
      }
    }

    // Essentially having the purify spirit cast not be able to trigger the cooldown, the dispel event does it instead.
    if (spellId === SPELLS.PURIFY_SPIRIT.id) {
      return;
    }

    super.beginCooldown(spellId, timestamp);
  }

  /**
   * Extends the cooldown for the provided spell by the provided duration.
   * @param {number} spellId The ID of the spell.
   * @param {number} extensionMs The duration to extend the cooldown with, in milliseconds.
   * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
   * @returns {*}
   */
  extendCooldown(spellId, extensionMs, timestamp = this.owner.currentTimestamp) {
    //const canSpellId = this._getCanonicalId(spellId);
    if (!this.isOnCooldown(spellId)) {
      //throw new Error(`Tried to extend the cooldown of ${canSpellId}, but it's not on cooldown.`);
      super.beginCooldown(spellId, timestamp);
      console.log('test');
      return;
    }
    //const cooldownRemaining = this.cooldownRemaining(canSpellId, timestamp);
    const cooldown = this._currentCooldowns[spellId];
    console.log(cooldown);

    const newExpectedDuration = cooldown.expectedDuration + extensionMs;

    cooldown.expectedDuration = newExpectedDuration;
    console.log(cooldown);
  }
}

export default SpellUsable;
