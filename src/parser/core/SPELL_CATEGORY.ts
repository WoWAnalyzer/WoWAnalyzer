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
      return 'Rotational Spell';
    case SPELL_CATEGORY.ROTATIONAL_AOE:
      return 'Spell (AOE)';
    case SPELL_CATEGORY.ITEMS:
      return 'Item';
    case SPELL_CATEGORY.COOLDOWNS:
      return 'Cooldown';
    case SPELL_CATEGORY.DEFENSIVE:
      return 'Defensive Cooldown';
    case SPELL_CATEGORY.SEMI_DEFENSIVE:
      return 'Offensive & Defensive Cooldown';
    case SPELL_CATEGORY.OTHERS:
      return 'Spell';
    case SPELL_CATEGORY.UTILITY:
      return 'Utility';
    case SPELL_CATEGORY.HEALER_DAMAGING_SPELL:
      return 'Damaging Spell';
    case SPELL_CATEGORY.CONSUMABLE:
      return 'Consumable';
    default:
      // Should never happen
      return 'Unknown Spell Category';
  }
}

export default SPELL_CATEGORY;
