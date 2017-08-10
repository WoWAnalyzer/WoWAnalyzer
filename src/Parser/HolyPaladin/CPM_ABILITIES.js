import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Rotational Spell',
  COOLDOWNS: 'Cooldown',
  OTHERS: 'Spell',
};

const CPM_ABILITIES = [
  {
    spell: SPELLS.HOLY_SHOCK_HEAL,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCasts: castCount => castCount.healingHits,
    getCooldown: haste => 9 / (1 + haste),
  },
  {
    spell: SPELLS.LIGHT_OF_DAWN_CAST,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 12 / (1 + haste),
    getOverhealing: (_, getAbility) => {
      const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.LIGHT_OF_DAWN_HEAL.id);
      return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
    },
  },
  {
    spell: SPELLS.JUDGMENT_CAST,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 12 / (1 + haste),
    isActive: combatant => combatant.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT.id),
    recommendedCastEfficiency: 0.85, // this rarely overheals, so keeping this on cooldown is pretty much always best
    getOverhealing: (_, getAbility) => {
      const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.JUDGMENT_OF_LIGHT_HEAL.id);
      return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
    },
    extraSuggestion: 'You should cast it whenever Judgment of Light has dropped, which is usually on cooldown without delay. Alternatively you can ignore the debuff and just cast it whenever Judgment is available; there\'s nothing wrong with ignoring unimportant things to focus on important things.',
  },
  {
    spell: SPELLS.BESTOW_FAITH_TALENT,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 12,
    isActive: combatant => combatant.hasTalent(SPELLS.BESTOW_FAITH_TALENT.id),
    recommendedCastEfficiency: 0.65,
  },
  {
    spell: SPELLS.LIGHTS_HAMMER_TALENT,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 60,
    isActive: combatant => combatant.hasTalent(SPELLS.LIGHTS_HAMMER_TALENT.id),
    getOverhealing: (_, getAbility) => {
      const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.LIGHTS_HAMMER_HEAL.id);
      return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
    },
  },
  {
    spell: SPELLS.CRUSADER_STRIKE,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 4.5 / (1 + haste),
    charges: 2,
    isActive: combatant => combatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id),
    recommendedCastEfficiency: 0.60,
  },
  {
    spell: SPELLS.HOLY_PRISM_TALENT,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 20,
    isActive: combatant => combatant.hasTalent(SPELLS.HOLY_PRISM_TALENT.id),
  },
  {
    spell: SPELLS.RULE_OF_LAW_TALENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 30,
    charges: 2,
    isActive: combatant => combatant.hasTalent(SPELLS.RULE_OF_LAW_TALENT.id),
    noSuggestion: true,
  },
  {
    spell: SPELLS.DIVINE_PROTECTION,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 60,
    recommendedCastEfficiency: 0.6,
    importance: ISSUE_IMPORTANCE.MINOR,
  },
  {
    spell: SPELLS.ARCANE_TORRENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    hideWithZeroCasts: true,
  },
  {
    spell: SPELLS.TYRS_DELIVERANCE_CAST,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    extraSuggestion: '',
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
    spell: SPELLS.HOLY_AVENGER_TALENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    isActive: combatant => combatant.hasTalent(SPELLS.HOLY_AVENGER_TALENT.id),
  },
  {
    spell: SPELLS.AVENGING_WRATH,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 120,
  },
  {
    spell: SPELLS.BLESSING_OF_SACRIFICE,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 150,
    recommendedCastEfficiency: 0.5,
    noSuggestion: true,
    importance: ISSUE_IMPORTANCE.MINOR,
  },
  {
    spell: SPELLS.AURA_MASTERY,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
  },
  {
    spell: SPELLS.LIGHT_OF_THE_MARTYR,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },
  {
    spell: SPELLS.FLASH_OF_LIGHT,
    name: `Filler ${SPELLS.FLASH_OF_LIGHT.name}`,
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => (castCount.casts || 0) - (castCount.healingIolHits || 0),
    getCooldown: haste => null,
    getOverhealing: ({ healingEffective, healingAbsorbed, healingOverheal, healingIolHealing, healingIolAbsorbed, healingIolOverheal }) => (healingOverheal - healingIolOverheal) / ((healingEffective - healingIolHealing) + (healingAbsorbed - healingIolAbsorbed) + (healingOverheal - healingIolOverheal)),
  },
  {
    spell: SPELLS.FLASH_OF_LIGHT,
    name: `Infusion of Light ${SPELLS.FLASH_OF_LIGHT.name}`,
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => castCount.healingIolHits || 0,
    getCooldown: haste => null,
    getOverhealing: ({ healingIolHealing, healingIolAbsorbed, healingIolOverheal }) => healingIolOverheal / (healingIolHealing + healingIolAbsorbed + healingIolOverheal),
  },
  {
    spell: SPELLS.HOLY_LIGHT,
    name: `Filler ${SPELLS.HOLY_LIGHT.name}`,
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => (castCount.casts || 0) - (castCount.healingIolHits || 0),
    getCooldown: haste => null,
    getOverhealing: ({ healingEffective, healingAbsorbed, healingOverheal, healingIolHealing, healingIolAbsorbed, healingIolOverheal }) => (healingOverheal - healingIolOverheal) / ((healingEffective - healingIolHealing) + (healingAbsorbed - healingIolAbsorbed) + (healingOverheal - healingIolOverheal)),
  },
  {
    spell: SPELLS.HOLY_LIGHT,
    name: `Infusion of Light ${SPELLS.HOLY_LIGHT.name}`,
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => castCount.healingIolHits || 0,
    getCooldown: haste => null,
    getOverhealing: ({ healingIolHealing, healingIolAbsorbed, healingIolOverheal }) => healingIolOverheal / (healingIolHealing + healingIolAbsorbed + healingIolOverheal),
  },
];

export default CPM_ABILITIES;
