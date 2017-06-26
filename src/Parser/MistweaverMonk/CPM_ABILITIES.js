import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Rotational Spell',
  COOLDOWNS: 'Cooldown',
  OTHERS: 'Spell',
  UTILITY: 'Utility',
};

const CPM_ABILITIES = [
  // Rotational Spells
  {
    spell: SPELLS.RENEWING_MIST,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 8,
    recommendedCastEfficiency: .9,
    getOverhealing: (_, getAbility) => {
      const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.RENEWING_MIST_HEAL.id);
      return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
    },
  },
  // Cooldowns
  {
    spell: SPELLS.THUNDER_FOCUS_TEA,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 30,
  },
  {
    spell: SPELLS.CHI_BURST_TALENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 30,
    isActive: combatant => combatant.hasTalent(SPELLS.CHI_BURST_TALENT.id),
    getOverhealing: (_, getAbility) => {
      const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.CHI_BURST_HEAL.id);
      return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
    },
  },
  {
    spell: SPELLS.INVOKE_CHIJI_TALENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
    isActive: combatant => combatant.hasTalent(SPELLS.INVOKE_CHIJI_TALENT.id),
  },
  {
    spell: SPELLS.MANA_TEA_TALENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    isActive: combatant => combatant.hasTalent(SPELLS.MANA_TEA_TALENT.id),
  },
  {
    spell: SPELLS.VELENS_FUTURE_SIGHT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 75,
    isActive: combatant => combatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id),
  },
  {
    spell: SPELLS.GNAWED_THUMB_RING,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
    isActive: combatant => combatant.hasFinger(ITEMS.GNAWED_THUMB_RING.id),
  },
  {
    spell: SPELLS.CLEANSING_MATRIX,
    name: `${ITEMS.ARCHIVE_OF_FAITH.name}`,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 60,
    isActive: combatant => combatant.hasTrinket(ITEMS.ARCHIVE_OF_FAITH.id),
  },
  {
    spell: SPELLS.LIFE_COCOON,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
    noSuggestion: true,
    noCanBeImproved: true,
  },
  {
    spell: SPELLS.REVIVAL,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: (haste, combatant) => 180 - (combatant.traitsBySpellId[SPELLS.TENDRILS_OF_REVIVAL.id] || 0 ) * 10,
    noSuggestion: true,
    noCanBeImproved: true,
  },


  // Other Spell Casting Metrics
  {
    spell: SPELLS.EFFUSE,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },

  {
    spell: SPELLS.ENVELOPING_MISTS,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },
  {
    spell: SPELLS.VIVIFY,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
    getOverhealing: (_, getAbility) => {
      const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.VIVIFY.id);
      return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
    },
  },
  {
    spell: SPELLS.SHEILUNS_GIFT,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
    getOverhealing: (_, getAbility) => {
      const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.SHEILUNS_GIFT.id);
      return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
    },
  },
  {
    spell: SPELLS.ESSENCE_FONT,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
    getOverhealing: (_, getAbility) => {
      const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.ESSENCE_FONT_BUFF.id);
      return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
    },
  },
  {
    spell: SPELLS.SOOTHING_MIST,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
    getOverhealing: (_, getAbility) => {
      const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.SOOTHING_MIST.id);
      return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
    },
  },
  {
    spell: SPELLS.REFRESHING_JADE_WIND_TALENT,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
    isActive: combatant => combatant.hasTalent(SPELLS.REFRESHING_JADE_WIND_TALENT.id),
    getOverhealing: (_, getAbility) => {
      const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.REFRESHING_JADE_WIND_HEAL.id);
      return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
    },
  },

  // Utility Spells
  {
    spell: SPELLS.ARCANE_TORRENT,
    category: SPELL_CATEGORY.UTILITY,
    getCooldown: haste => 90,
    hideWithZeroCasts: true,
  },
  {
    spell: SPELLS.DIFFUSE_MAGIC_TALENT,
    category: SPELL_CATEGORY.UTILITY,
    getCooldown: haste => 90,
    isActive: combatant => combatant.hasTalent(SPELLS.DIFFUSE_MAGIC_TALENT.id),
    noSuggestion: true,
    noCanBeImproved: true,
  },
  {
    spell: SPELLS.DAMPEN_HARM_TALENT,
    category: SPELL_CATEGORY.UTILITY,
    getCooldown: haste => 120,
    isActive: combatant => combatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id),
    noSuggestion: true,
    noCanBeImproved: true,
  },
  {
    spell: SPELLS.FORTIFYING_BREW,
    category: SPELL_CATEGORY.UTILITY,
    getCooldown: haste => 90,
    noSuggestion: true,
    noCanBeImproved: true,
  },
  {
    spell: SPELLS.HEALING_ELIXIR_TALENT,
    category: SPELL_CATEGORY.UTILITY,
    charges: 2,
    getCooldown: haste => 30,
    isActive: combatant => combatant.hasTalent(SPELLS.HEALING_ELIXIR_TALENT.id),
    noSuggestion: true,
    noCanBeImproved: true,
  },

];

export default CPM_ABILITIES;
