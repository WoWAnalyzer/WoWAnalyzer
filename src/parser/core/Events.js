import EventFilter from './EventFilter';

const Events = {
  /**
   * BEWARE: These events/properties are NOT COMPLETE. See the Event log for a full list of available props and events.
   *
   * Generic props:
   * - timestamp: the timestamp of the event, relative to log start
   * - type: the event type, you should generally not use this and properly separate event listeners.
   * - sourceID: who initiated the event
   * - sourceIsFriendly: whether the source was friendly to the selected player
   * - targetID: who was affected by the event
   * - targetIsFriendly: whether the target was friendly to the selected player. BEWARE: @Any dps classes: make sure if you do a damage statistic that you do NOT include friendly fire to other players (such as from Aura of Sacrifice). This does not gain any damage bonuses.
   * - ability: object of the ability/spell involved. Shape: { name, guid, type: I believe this is the magic school type, abilityIcon }
   * - resourceActor:
   * - classResources: array of resources (mana, energy, etc)
   * - hitPoints:
   * - maxHitPoints:
   * - attackPower:
   * - spellPower:
   * - x: x location on the map. See paladin/holy/modules/features/MasteryEffectiveness for an example module that uses this data.
   * - y: y location on the map
   * - facing: the direction the player is facing
   * - sourceMarker:
   * - targetMarker:
   * - mapID:
   * - itemLevel:
   */

  /**
   * This event is called for events where the player, a player pet or a target of the player/player pet dealt or took damage.
   * Event specific props:
   * - amount: effective damage
   * - absorbed: damage absorbed by a buff on the target (e.g. https://www.wowhead.com/spell=269279/resounding-protection). This should generally be considered effective damage.
   * - overkill: if the target died, this is the amount of damage that exceeded their remaining health
   * - hitType:
   * - mitigated:
   * - unmitigatedAmount:
   * - tick:
   *
   * NOTE: Do not use this event to track absorb-healing (e.g. by a spell such as Resounding Protection). Use the `absorbed` event instead.
   * @returns {EventFilter}
   */
  get damage() {
    return new EventFilter('damage');
  },
  /**
   * This event is called for events where the player, a player pet or a target of the player/player pet was healed.
   * Event specific props:
   * - amount: effective healing
   * - absorbed: healing absorbed by a debuff on the target (e.g. https://www.wowhead.com/spell=233263/embrace-of-the-eclipse). This should generally be considered effective healing.
   * - overheal: overhealing
   * @returns {EventFilter}
   */
  get heal() {
    return new EventFilter('heal');
  },
  /**
   * Triggered in addition to the regular heal event whenever a heal is absorbed. Can be used to determine what buff or debuff was absorbing the healing.
   * NOTE: This should only be used if you need to know **which ability soaked the healing**. If you want to track the amount of absorbed healing by a spell, use the `absorb` prop of the `heal` event.
   * @returns {EventFilter}
   */
  get healabsorbed() {
    return new EventFilter('healabsorbed');
  },
  /**
   * This event is called for events where the player, a player pet or a target of the player/player pet was healed.
   * Event specific props:
   * - ability: The ability responsible for absorbed damage (i.e. the shield)
   * - amount: effective damage absorbed
   * - attackerID:
   * - attackerIsFriendly:
   * - extraAbility: The damage ability that was absorbed
   * @returns {EventFilter}
   */
  get absorbed() {
    return new EventFilter('absorbed');
  },
  /**
   * This event is called when the player begins casting an ability that has a cast time. This is also called for some channeled abilities, but not everyone. This is NOT cast for most instant abilities.
   * @returns {EventFilter}
   */
  get begincast() {
    return new EventFilter('begincast');
  },
  /**
   * This event is called when the player successfully cast an ability.
   * BEWARE: Blizzard also sometimes uses this event type for mechanics and spell ticks or bolts. This can even occur in between a begincast and cast finish!
   * @returns {EventFilter}
   */
  get cast() {
    return new EventFilter('cast');
  },
  /**
   * Event specific props:
   * - absorb: If the buff can absorb damage, the size of the shield.
   * @returns {EventFilter}
   */
  get applybuff() {
    return new EventFilter('applybuff');
  },
  /**
   * Event specific props:
   * - absorb: If the buff can absorb healing (maybe there are debuffs that absorb damage too?), this reflects the size of the (healing) absorb.
   * @returns {EventFilter}
   */
  get applydebuff() {
    return new EventFilter('applydebuff');
  },
  get applybuffstack() {
    return new EventFilter('applybuffstack');
  },
  get applydebuffstack() {
    return new EventFilter('applydebuffstack');
  },
  /**
   * Event specific props:
   * - stack
   * @returns {EventFilter}
   */
  get removebuffstack() {
    return new EventFilter('removebuffstack');
  },
  /**
   * Event specific props:
   * - stack
   * @returns {EventFilter}
   */
  get removedebuffstack() {
    return new EventFilter('removedebuffstack');
  },
  get refreshbuff() {
    return new EventFilter('refreshbuff');
  },
  get refreshdebuff() {
    return new EventFilter('refreshdebuff');
  },
  /**
   * Event specific props:
   * - absorb: If the buff could absorb damage, the size of the shield remaining. This is UNUSED/WASTED damage absorb.
   * @returns {EventFilter}
   */
  get removebuff() {
    return new EventFilter('removebuff');
  },
  /**
   * Event specific props:
   * - absorb: If the buff could absorb healing (maybe there are debuffs that absorb damage too?), this reflects the size of the (healing) absorb.
   * @returns {EventFilter}
   */
  get removedebuff() {
    return new EventFilter('removedebuff');
  },
  get summon() {
    return new EventFilter('summon');
  },
  /**
   * Triggered at the start of the fight with advanced combat logging on. This includes gear, talents, etc.
   * BEWARE: It should generally not be used as all its data should be available in `this.selectedCombatant`.
   * @returns {EventFilter}
   */
  get combatantinfo() {
    return new EventFilter('combatantinfo');
  },
  get energize() {
    return new EventFilter('energize');
  },
  get interrupt() {
    return new EventFilter('interrupt');
  },
  get death() {
    return new EventFilter('death');
  },
  get resurrect() {
    return new EventFilter('resurrect');
  },
};

export default Events;
