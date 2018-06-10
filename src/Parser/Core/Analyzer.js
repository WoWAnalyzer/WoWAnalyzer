import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';
import Module from './Module';

class Analyzer extends Module {
  static __dangerousInvalidUsage = false;

  triggerEvent(event) {
    // Triggering a lot of events here for development pleasure; does this have a significant performance impact?
    this._callMethod(this._eventHandlerName('event'), event.type, event);
    this._callMethod(this._eventHandlerName(event.type), event);
    if (this.owner && this.owner.byPlayer(event)) {
      this._callMethod(this._eventHandlerName(`byPlayer_${event.type}`), event);
    }
    if (this.owner && this.owner.toPlayer(event)) {
      this._callMethod(this._eventHandlerName(`toPlayer_${event.type}`), event);
    }
    if (this.owner && this.owner.byPlayerPet(event)) {
      this._callMethod(this._eventHandlerName(`byPlayerPet_${event.type}`), event);
    }
    if (this.owner && this.owner.toPlayerPet(event)) {
      this._callMethod(this._eventHandlerName(`toPlayerPet_${event.type}`), event);
    }
  }
  _eventHandlerName(eventType) {
    return `on_${eventType}`;
  }
  _callMethod(methodName, ...args) {
    const method = this[methodName];
    if (method) {
      method.call(this, ...args);
    }
  }


  // Override these with functions that return info about their rendering in the specific slots
  item() { return undefined; }
  statistic() { return undefined; }
  statisticOrder = STATISTIC_ORDER.DEFAULT;
  suggestions(when) { return undefined; }
  tab() { return undefined; }

  // region Common event handler shells.
  /**
   * These have three goals:
   * 1. To improve auto-completion
   * 2. As documentation
   * 3. So that implementors can always properly call `super`. This is still optional for normal modules (modules extending only this class) since it's rarely needed. It should be considered required for modules that extend other modules.
   *
   * Please don't hesitate to add more information to this section. Clarifying what triggers an event and about its contents would be great.
   * Events that are spec-specific do not belong here.
   *
   * Variants available:
   * - no filter - Includes all events available. The WCL API only sends events related to the selected player.
   * - byPlayer - This is only called for events that are done BY the player. Anyone can be the target.
   * - byPlayerPet - This is only called for events that are done BY one of the player's pets. Anyone can be the target.
   * - toPlayer - This is only called for events that are done TO the player. Anyone can be the source. Pets are NOT included!
   * - toPlayerPet - This is only called for events that are done TO one of the player's pets. Anyone can be the source.
   */

  /**
   * Called when the parser finished initializing; after all modules are loaded, normalizers have ran and combatants were initialized.
   * Use this method to toggle the module on/off based on having items equipped, talents selected, etc.
   */
  on_initialized() {}
  /**
   * Called for every single event.
   * @param {object} event
   */
  on_event(event) {}
  // region damage
  /**
   * Called when someone deals/takes damage.
   * @param {object} event
   */
  on_damage(event) {}
  // Damage done
  on_byPlayer_damage(event) {}
  on_byPlayerPet_damage(event) {}
  // Damage taken
  on_toPlayer_damage(event) {}
  on_toPlayerPet_damage(event) {}
  // endregion
  // region heal
  /**
   * Called when someone is healed.
   * @param {object} event
   */
  on_heal(event) {}
  // Healing done
  on_byPlayer_heal(event) {}
  on_byPlayerPet_heal(event) {}
  // Healing received
  on_toPlayer_heal(event) {}
  on_toPlayerPet_heal(event) {}
  // endregion
  // region absorbed
  /**
   * Called when something absorbs damage.
   * @param {object} event
   */
  on_absorbed(event) {}
  on_byPlayer_absorbed(event) {}
  on_byPlayerPet_absorbed(event) {}
  on_toPlayer_absorbed(event) {}
  on_toPlayerPet_absorbed(event) {}
  // endregion
  // region applybuff
  /**
   * Called when a buff was freshly applied.
   * @param {object} event
   */
  on_applybuff(event) {}
  on_byPlayer_applybuff(event) {}
  on_byPlayerPet_applybuff(event) {}
  on_toPlayer_applybuff(event) {}
  on_toPlayerPet_applybuff(event) {}
  // endregion
  // region refreshbuff
  /**
   * Called when a buff was refreshed (it was already active).
   * @param {object} event
   */
  on_refreshbuff(event) {}
  on_byPlayer_refreshbuff(event) {}
  on_byPlayerPet_refreshbuff(event) {}
  on_toPlayer_refreshbuff(event) {}
  on_toPlayerPet_refreshbuff(event) {}
  // endregion
  // region removebuff
  /**
   * Called when a buff is removed.
   * @param {object} event
   */
  on_removebuff(event) {}
  on_byPlayer_removebuff(event) {}
  on_byPlayerPet_removebuff(event) {}
  on_toPlayer_removebuff(event) {}
  on_toPlayerPet_removebuff(event) {}
  // endregion
  // region applybuffstack
  /**
   * Called when a buff gains one or more stacks.
   * @param {object} event
   */
  on_applybuffstack(event) {}
  on_byPlayer_applybuffstack(event) {}
  on_byPlayerPet_applybuffstack(event) {}
  on_toPlayer_applybuffstack(event) {}
  on_toPlayerPet_applybuffstack(event) {}
  // endregion
  // region removebuffstack
  /**
   * Called when a buff loses one or more stacks.
   * @param {object} event
   */
  on_removebuffstack(event) {}
  on_byPlayer_removebuffstack(event) {}
  on_byPlayerPet_removebuffstack(event) {}
  on_toPlayer_removebuffstack(event) {}
  on_toPlayerPet_removebuffstack(event) {}
  // endregion
  // region changebuffstack:
  /**
   * Buff changed.
   * THIS EVENT IS FABRICATED. https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Core/Modules/Entities.js#L146
   * This is a fabricated event to make buff tracking easier. This is fired for all buff events that add or remove a stack, including the initial application and final removal unlike any other buff events.
   * It holds the properties of the original buff event, and the `oldStacks`, `newStacks`, and `stacksGained` properties. If oldStacks is 0 the buff is fresh, if newStacks is 0, it is removed.
   *
   * @param event
   */
  on_changebuffstack(event) {}
  on_byPlayer_changebuffstack(event) {}
  on_byPlayerPet_changebuffstack(event) {}
  on_toPlayer_changebuffstack(event) {}
  on_toPlayerPet_changebuffstack(event) {}
  // endregion
  // region applydebuff
  /**
   * Called when a debuff was freshly applied.
   * @param {object} event
   */
  on_applydebuff(event) {}
  on_byPlayer_applydebuff(event) {}
  on_byPlayerPet_applydebuff(event) {}
  on_toPlayer_applydebuff(event) {}
  on_toPlayerPet_applydebuff(event) {}
  // endregion
  // region refreshdebuff
  /**
   * Called when a debuff was refreshed (it was already active).
   * @param {object} event
   */
  on_refreshdebuff(event) {}
  on_byPlayer_refreshdebuff(event) {}
  on_byPlayerPet_refreshdebuff(event) {}
  on_toPlayer_refreshdebuff(event) {}
  on_toPlayerPet_refreshdebuff(event) {}
  // endregion
  // region removedebuff
  /**
   * Called when a debuff is removed.
   * @param {object} event
   */
  on_removedebuff(event) {}
  on_byPlayer_removedebuff(event) {}
  on_byPlayerPet_removedebuff(event) {}
  on_toPlayer_removedebuff(event) {}
  on_toPlayerPet_removedebuff(event) {}
  // endregion
  // region applydebuffstack
  /**
   * Called when a debuff gains one or more stacks.
   * @param {object} event
   */
  on_applydebuffstack(event) {}
  on_byPlayer_applydebuffstack(event) {}
  on_byPlayerPet_applydebuffstack(event) {}
  on_toPlayer_applydebuffstack(event) {}
  on_toPlayerPet_applydebuffstack(event) {}
  // endregion
  // region removedebuffstack
  /**
   * Called when a debuff loses one or more stacks.
   * @param {object} event
   */
  on_removedebuffstack(event) {}
  on_byPlayer_removedebuffstack(event) {}
  on_byPlayerPet_removedebuffstack(event) {}
  on_toPlayer_removedebuffstack(event) {}
  on_toPlayerPet_removedebuffstack(event) {}
  // endregion
  // region changedebuffstack:
  /**
   * debuff changed.
   * This is a fabricated event to make debuff tracking easier. This is fired for all debuff events that add or remove a stack, including the initial application and final removal unlike any other debuff events.
   * It holds the properties of the original debuff event, and the `oldStacks`, `newStacks`, and `stacksGained` properties. If oldStacks is 0 the debuff is fresh, if newStacks is 0, it is removed.
   *
   * @param event
   */
  on_changedebuffstack(event) {}
  on_byPlayer_changedebuffstack(event) {}
  on_byPlayerPet_changedebuffstack(event) {}
  on_toPlayer_changedebuffstack(event) {}
  on_toPlayerPet_changedebuffstack(event) {}
  // endregion
  // region energize
  /**
   * Called when someone gains a resource (e.g. mana) from a (de)buff, proc or other special effect.
   * @param {object} event
   */
  on_energize(event) {}
  on_byPlayer_energize(event) {}
  on_byPlayerPet_energize(event) {}
  on_toPlayer_energize(event) {}
  on_toPlayerPet_energize(event) {}
  // endregion
  // region death
  /**
   * Called when something dies.
   * @param {object} event
   */
  on_death(event) {}
  on_byPlayer_death(event) {}
  on_byPlayerPet_death(event) {}
  on_toPlayer_death(event) {}
  on_toPlayerPet_death(event) {}
  // endregion
  // region instakill
  /**
   * Called when something instantly dies.
   * @param {object} event
   */
  on_instakill(event) {}
  on_byPlayer_instakill(event) {}
  on_byPlayerPet_instakill(event) {}
  on_toPlayer_instakill(event) {}
  on_toPlayerPet_instakill(event) {}
  // endregion
  // region resurrect
  /**
   * Called when something resurrects.
   * @param {object} event
   */
  on_resurrect(event) {}
  on_byPlayer_resurrect(event) {}
  on_byPlayerPet_resurrect(event) {}
  on_toPlayer_resurrect(event) {}
  on_toPlayerPet_resurrect(event) {}
  // endregion
  // region globalcooldown
  /**
   * This event is triggered whenever the selected player triggers a GCD event when casting abilities listed in the Abilities config as being on the GCD.
   * THIS EVENT IS FABRICATED. https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Core/Modules/GlobalCooldown.js
   *
   * @param {object} event
   */
  on_globalcooldown(event) {}
  on_byPlayer_globalcooldown(event) {}
  on_toPlayer_globalcooldown(event) {}
  // endregion
  // region begincast
  /**
   * Triggered when an actor starts casting any cast time spell and some channeled spells. Using the `beginchannel` event instead is recommended since it's more consistent.
   * @param {object} event
   */
  on_begincast(event) {}
  on_byPlayer_begincast(event) {}
  on_byPlayerPet_begincast(event) {}
  on_toPlayer_begincast(event) {}
  on_toPlayerPet_begincast(event) {}
  // endregion
  // region beginchannel
  /**
   * Triggered when an actor starts channeling/casting something. This is more reliable that begincast since begincast doesn't trigger for most channeled abilities.
   * THIS EVENT IS FABRICATED. https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Core/Modules/Channeling.js
   *
   * @param {object} event
   */
  on_beginchannel(event) {}
  on_byPlayer_beginchannel(event) {}
  // endregion
  // region endchannel
  /**
   * Triggered when an actor ends channeling/casting something. This doesn't include canceled casts.
   * THIS EVENT IS FABRICATED. https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Core/Modules/Channeling.js
   *
   * @param {object} event
   */
  on_endchannel(event) {}
  on_byPlayer_endchannel(event) {}
  // endregion
  // region cancelchannel
  /**
   * Triggered when an actor's channeling/casting is cancelled.
   * THIS EVENT IS FABRICATED. https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/src/Parser/Core/Modules/Channeling.js
   *
   * @param {object} event
   */
  on_cancelchannel(event) {}
  on_byPlayer_cancelchannel(event) {}
  // endregion
  // region cast
  /**
   * Called for when a cast finishes. Can also occur for procs, or even boss abilities (e.g. Trilliax's laser trigger a cast event when someone is hit by it).
   * @param {object} event
   */
  on_cast(event) {}
  on_byPlayer_cast(event) {}
  on_byPlayerPet_cast(event) {}
  on_toPlayer_cast(event) {}
  on_toPlayerPet_cast(event) {}
  // endregion
  // region summon
  /**
   * Called when a new entity is summoned.
   * @param {object} event
   */
  on_summon(event) {}
  on_byPlayer_summon(event) {}
  on_byPlayerPet_summon(event) {}
  on_toPlayer_summon(event) {}
  on_toPlayerPet_summon(event) {}
  // endregion
  // endregion
}

export default Analyzer;
