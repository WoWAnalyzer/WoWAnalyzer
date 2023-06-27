import { defineMessage } from '@lingui/macro';
import { i18n } from '@lingui/core';

enum SPELL_CATEGORY {
  ROTATIONAL,
  ROTATIONAL_AOE,
  ITEMS,
  COOLDOWNS,
  DEFENSIVE,
  SEMI_DEFENSIVE,
  OTHERS,
  UTILITY,
  HEALER_DAMAGING_SPELL,
  CONSUMABLE,
  HIDDEN,
}

export function getSpellCategoryName(category: SPELL_CATEGORY) {
  switch (category) {
    case SPELL_CATEGORY.ROTATIONAL:
      return i18n._(
        defineMessage({
          id: 'core.abilities.spellCategories.rotational',
          message: `Rotational Spell`,
        }),
      );
    case SPELL_CATEGORY.ROTATIONAL_AOE:
      return i18n._(
        defineMessage({
          id: 'core.abilities.spellCategories.rotationalAoe',
          message: `Spell (AOE)`,
        }),
      );
    case SPELL_CATEGORY.ITEMS:
      return i18n._(
        defineMessage({
          id: 'core.abilities.spellCategories.items',
          message: `Item`,
        }),
      );
    case SPELL_CATEGORY.COOLDOWNS:
      return i18n._(
        defineMessage({
          id: 'core.abilities.spellCategories.cooldowns',
          message: `Cooldown`,
        }),
      );
    case SPELL_CATEGORY.DEFENSIVE:
      return i18n._(
        defineMessage({
          id: 'core.abilities.spellCategories.defensive',
          message: `Defensive Cooldown`,
        }),
      );
    case SPELL_CATEGORY.SEMI_DEFENSIVE:
      return i18n._(
        defineMessage({
          id: 'core.abilities.spellCategories.semiDefensive',
          message: `Offensive & Defensive Cooldown`,
        }),
      );
    case SPELL_CATEGORY.OTHERS:
      return i18n._(
        defineMessage({
          id: 'core.abilities.spellCategories.others',
          message: `Spell`,
        }),
      );
    case SPELL_CATEGORY.UTILITY:
      return i18n._(
        defineMessage({
          id: 'core.abilities.spellCategories.utility',
          message: `Utility`,
        }),
      );
    case SPELL_CATEGORY.HEALER_DAMAGING_SPELL:
      return i18n._(
        defineMessage({
          id: 'core.abilities.spellCategories.healerDamagingSpell',
          message: `Damaging Spell`,
        }),
      );
    case SPELL_CATEGORY.CONSUMABLE:
      return i18n._(
        defineMessage({
          id: 'core.abilities.spellCategories.consumable',
          message: `Consumable`,
        }),
      );
    default:
      // Should never happen
      return 'Unknown Spell Category';
  }
}

export default SPELL_CATEGORY;
