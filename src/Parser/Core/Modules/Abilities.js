import Analyzer from 'Parser/Core/Analyzer';

import Ability from './Ability';
import AbilityTracker from './AbilityTracker';
import Combatants from './Combatants';
import Haste from './Haste';

class Abilities extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
    haste: Haste,
  };
  static SPELL_CATEGORIES = {
    ROTATIONAL: 'Rotational Spell',
    ROTATIONAL_AOE: 'Spell (AOE)',
    ITEMS: 'Item',
    COOLDOWNS: 'Cooldown',
    DEFENSIVE: 'Defensive Cooldown',
    OTHERS: 'Spell',
    UTILITY: 'Utility',
    HEALER_DAMAGING_SPELL: 'Damaging Spell',
    HIDDEN: 'Hidden',
  };
  static ABILITY_CLASS = Ability;

  /**
   * This will be called *once* during initialization. See the Ability class for the available properties. This should contain ALL spells available to a player of your spec, including utility such as interrupts, dispells, etc
   * @returns {object[]}
   */
  spellbook() {
    // This list will NOT be recomputed during the fight. If a cooldown changes based on something like Haste or a Buff you need to put it in a function.
    // While you can put checks for talents/traits outside of the cooldown prop, you generally should aim to keep everything about a single spell together. In general only move a prop up if you're regularly checking for the same talent/trait in multiple spells.
    return [];
  }

  abilities = [];
  activeAbilities = [];
  on_initialized() {
    this.abilities = this.spellbook().map(options => new this.constructor.ABILITY_CLASS(this, options));
    this.activeAbilities = this.abilities.filter(ability => ability.enabled);
  }

  /**
   * Add an ability to the list of active abilities.
   * @param {object} options An object with all the properties and their values that gets passed to the Ability class.
   */
  add(options) {
    const ability = new this.constructor.ABILITY_CLASS(this, options);
    this.abilities.push(ability);
    this.activeAbilities.push(ability);
  }

  /*
   * Returns the first ACTIVE spellInfo with the given spellId (or undefined if there is no such spellInfo)
   */
  getAbility(spellId) {
    return this.activeAbilities.find(ability => {
      if (ability.spell instanceof Array) {
        return ability.spell.some(spell => spell.id === spellId);
      } else {
        return ability.spell.id === spellId;
      }
    });
  }

  /*
   * Returns the expected cooldown (in seconds) of the given spellId at the current timestamp (or undefined if there is no such spellInfo)
   */
  getExpectedCooldownDuration(spellId) {
    const ability = this.getAbility(spellId);
    return ability ? ability.cooldown * 1000 : undefined;
  }

  /*
   * Returns the max charges of the given spellId, or 1 if the spell doesn't have charges (or undefined if there is no such spellInfo)
   */
  getMaxCharges(spellId) {
    const ability = this.getAbility(spellId);
    return ability ? (ability.charges || 1) : undefined;
  }
}

export default Abilities;
