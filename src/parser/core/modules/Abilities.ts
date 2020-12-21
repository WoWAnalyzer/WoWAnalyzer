import Module, { Options } from 'parser/core/Module';
import { t } from '@lingui/macro';

import Haste from 'parser/shared/modules/Haste';

import { AnyEvent } from '../Events';
import Ability, { SpellbookAbility } from './Ability';
import AbilityTracker from '../../shared/modules/AbilityTracker';

class Abilities extends Module {
  static dependencies = {
    abilityTracker: AbilityTracker,
    haste: Haste,
  };
  abilityTracker!: AbilityTracker;
  haste!: Haste;

  // TODO - Enum?
  static SPELL_CATEGORIES = {
    ROTATIONAL: t({
      id: "core.abilities.spellCategories.rotational",
      message: `Rotational Spell`
    }),
    ROTATIONAL_AOE: t({
      id: "core.abilities.spellCategories.rotationalAoe",
      message: `Spell (AOE)`
    }),
    ITEMS: t({
      id: "core.abilities.spellCategories.items",
      message: `Item`
    }),
    COOLDOWNS: t({
      id: "core.abilities.spellCategories.cooldowns",
      message: `Cooldown`
    }),
    DEFENSIVE: t({
      id: "core.abilities.spellCategories.defensive",
      message: `Defensive Cooldown`
    }),
    SEMI_DEFENSIVE: t({
      id: "core.abilities.spellCategories.semiDefensive",
      message: `Offensive & Defensive Cooldown`
    }),
    OTHERS: t({
      id: "core.abilities.spellCategories.others",
      message: `Spell`
    }),
    UTILITY: t({
      id: "core.abilities.spellCategories.utility",
      message: `Utility`
    }),
    HEALER_DAMAGING_SPELL: t({
      id: "core.abilities.spellCategories.healerDamagingSpell",
      message: `Damaging Spell`
    }),
    CONSUMABLE: t({
      id: "core.abilities.spellCategories.consumable",
      message: `Consumable`
    }),
    HIDDEN: t({
      id: "core.abilities.spellCategories.hidden",
      message: `Hidden`
    }),
  };
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
    this.abilities = spellbook.map(options => new Ability(this, options));
    this.activeAbilities = this.abilities.filter(ability => ability.enabled);
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
    const ability = this.activeAbilities.find(ability => {
      if (ability.spell instanceof Array) {
        return ability.spell.some(spell => spell.id === spellId);
      } else {
        return ability.spell.id === spellId;
      }
    });

    if(ability && ability.spell instanceof Array && ability.primaryOverride === undefined) {
      ability.primaryOverride = ability.spell.findIndex((spell) => spell.id === spellId);
    }

    return ability;
  }

  /**
   * Returns the expected cooldown (in seconds) of the given spellId at the current timestamp (or undefined if there is no such spellInfo)
   */
  getExpectedCooldownDuration(spellId: number, cooldownTriggerEvent?: AnyEvent) {
    const ability = this.getAbility(spellId);
    return ability ? Math.round(ability.getCooldown(this.haste.current, cooldownTriggerEvent) * 1000) : undefined;
  }

  /**
   * Returns the max charges of the given spellId, or 1 if the spell doesn't have charges (or undefined if there is no such spellInfo)
   */
  getMaxCharges(spellId: number) {
    const ability = this.getAbility(spellId);
    return ability ? (ability.charges || 1) : undefined;
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
