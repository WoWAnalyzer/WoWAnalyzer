import Module, { Options } from 'parser/core/Module';
import EventEmitter from 'parser/core/modules/EventEmitter';
import Haste from 'parser/shared/modules/Haste';

import AbilityTracker from '../../shared/modules/AbilityTracker';
import { AnyEvent, EventType } from '../Events';
import Ability, { SpellbookAbility } from './Ability';

class Abilities extends Module {
  static dependencies = {
    abilityTracker: AbilityTracker,
    eventEmitter: EventEmitter,
    haste: Haste,
  };
  abilityTracker!: AbilityTracker;
  eventEmitter!: EventEmitter;
  haste!: Haste;

  static ABILITY_CLASS = Ability;

  /**
   * This will be called *once* during initialization. See the Ability class for the available properties. This should contain ALL spells available to a player of your spec, including utility such as interrupts, dispells, etc
   * @returns {object[]}
   */
  spellbook(): SpellbookAbility[] {
    // This list will NOT be recomputed during the fight. If a cooldown changes based on something like Haste or a Buff you need to put it in a function.
    // While you can put checks for talents/traits outside of the cooldown prop, you generally should aim to keep everything about a single spell together. In general only move a prop up if you're regularly checking for the same talent/trait in multiple spells.
    return [];
  }

  abilities: Ability[] = [];
  activeAbilities: Ability[] = [];

  constructor(args: Options) {
    super(args);
    this.loadSpellbook(this.spellbook());
  }

  loadSpellbook(spellbook: SpellbookAbility[]) {
    // Abilities subtypes may want to construct a particular subtype of Ability
    const abilityClass = (this.constructor as typeof Abilities).ABILITY_CLASS;
    this.abilities = spellbook.map((options) => new abilityClass(this, options));
    this.activeAbilities = this.abilities.filter((ability) => ability.enabled);
  }

  /**
   * Add an ability to the list of active abilities.
   * @param {object} options An object with all the properties and their values that gets passed to the Ability class.
   */
  add(options: SpellbookAbility) {
    const ability = new Ability(this, options);
    this.abilities.push(ability);
    this.activeAbilities.push(ability);
  }

  /**
   * Returns the first ACTIVE spellInfo with the given spellId (or undefined if there is no such spellInfo)
   *
   * @return {Ability}
   */
  getAbility(spellId: number) {
    const ability = this.activeAbilities.find((ability) => {
      if (ability.spell instanceof Array) {
        return ability.spell.includes(spellId);
      } else {
        return ability.spell === spellId;
      }
    });

    if (ability && ability.spell instanceof Array && ability.primaryOverride === undefined) {
      ability.primaryOverride = ability.spell.findIndex((spell) => spell === spellId);
    }

    return ability;
  }

  getAbilityIndex(spellId: number) {
    const index = this.activeAbilities.findIndex((ability) => {
      if (ability.spell instanceof Array) {
        return ability.spell.includes(spellId);
      } else {
        return ability.spell === spellId;
      }
    });

    return index;
  }

  _getFromSelfOrId(abilityOrSpellId: number | Ability): Ability | undefined {
    return typeof abilityOrSpellId === 'number'
      ? this.getAbility(abilityOrSpellId)
      : abilityOrSpellId;
  }

  /**
   * Returns the expected cooldown (in milliseconds) of the given ability or ID at the current timestamp (or undefined if there is no such spellInfo)
   */
  getExpectedCooldownDuration(abilityOrSpellId: number | Ability): number | undefined {
    const ability = this._getFromSelfOrId(abilityOrSpellId);
    return ability ? Math.round(ability.getCooldown(this.haste.current) * 1000) : undefined;
  }

  /**
   * Returns the max charges of the given ability or ID, or 1 if the spell doesn't have charges (or undefined if there is no such spellInfo)
   */
  getMaxCharges(abilityOrSpellId: number | Ability): number | undefined {
    const ability = this._getFromSelfOrId(abilityOrSpellId);
    return ability ? ability.charges || 1 : undefined;
  }

  protected updateMaxCharges(spellId: number, maxCharges: number) {
    const abilityIndex = this.getAbilityIndex(spellId);

    if (abilityIndex === -1) {
      return;
    }

    // The amount of charges should never drop below 1.
    if (maxCharges < 1) {
      maxCharges = 1;
    }

    this.activeAbilities[abilityIndex].charges = maxCharges;
  }

  increaseMaxCharges(event: AnyEvent, spellId: number, increaseBy: number) {
    const currentCharges = this.getMaxCharges(spellId);

    if (currentCharges === undefined) {
      return;
    }

    this.updateMaxCharges(spellId, currentCharges + increaseBy);

    this.eventEmitter.fabricateEvent(
      {
        type: EventType.MaxChargesIncreased,
        timestamp: event.timestamp,
        spellId: spellId,
        by: increaseBy,
      },
      event,
    );
  }

  decreaseMaxCharges(event: AnyEvent, spellId: number, decreaseBy: number) {
    const currentCharges = this.getMaxCharges(spellId);

    if (currentCharges === undefined) {
      return;
    }

    this.updateMaxCharges(spellId, currentCharges - decreaseBy);

    this.eventEmitter.fabricateEvent(
      {
        type: EventType.MaxChargesDecreased,
        timestamp: event.timestamp,
        spellId: spellId,
        by: decreaseBy,
      },
      event,
    );
  }

  /**
   * Returns the timeline sort index, or null if none is set. (or undefined if there is no such spellInfo)
   */
  getTimelineSortIndex(spellId: number) {
    const ability = this.getAbility(spellId);
    return ability ? ability.timelineSortIndex : undefined;
  }
}

export default Abilities;
