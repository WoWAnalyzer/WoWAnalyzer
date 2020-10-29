import Module, { Options } from 'parser/core/Module';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import { AnyEvent } from '../Events';
import Ability, { SpellbookAbility } from './Ability';
import AbilityTracker from '../../shared/modules/AbilityTracker';
import Haste from '../../shared/modules/Haste';

class Abilities extends Module {
  static dependencies = {
    abilityTracker: AbilityTracker,
    haste: Haste,
  };
  abilityTracker!: AbilityTracker;
  haste!: Haste;

  // TODO - Enum?
  static SPELL_CATEGORIES = {
    ROTATIONAL: i18n._(t('core.abilities.spellCategories.rotational')`Rotational Spell`),
    ROTATIONAL_AOE: i18n._(t('core.abilities.spellCategories.rotationalAoe')`Spell (AOE)`),
    ITEMS: i18n._(t('core.abilities.spellCategories.items')`Item`),
    COOLDOWNS: i18n._(t('core.abilities.spellCategories.cooldowns')`Cooldown`),
    DEFENSIVE: i18n._(t('core.abilities.spellCategories.defensive')`Defensive Cooldown`),
    SEMI_DEFENSIVE: i18n._(t('core.abilities.spellCategories.semiDefensive')`Offensive & Defensive Cooldown`),
    OTHERS: i18n._(t('core.abilities.spellCategories.others')`Spell`),
    UTILITY: i18n._(t('core.abilities.spellCategories.utility')`Utility`),
    HEALER_DAMAGING_SPELL: i18n._(t('core.abilities.spellCategories.healerDamagingSpell')`Damaging Spell`),
    CONSUMABLE: i18n._(t('core.abilities.spellCategories.consumable')`Consumable`),
    HIDDEN: i18n._(t('core.abilities.spellCategories.hidden')`Hidden`),
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
