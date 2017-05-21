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
    spell: SPELLS.TRANQUILITY,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: (haste, combatant) => combatant.hasTalent(SPELLS.INNER_PEACE_TALENT.id) ? 120 : 180,
  },
  {
    spell: SPELLS.INNERVATE,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
  },
  {
    spell: SPELLS.ESSENCE_OF_GHANIR,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
  },
  {
    spell: SPELLS.IRONBARK,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    importance: ISSUE_IMPORTANCE.MINOR,
  },
  {
    spell: SPELLS.BARKSKIN,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 60,
    importance: ISSUE_IMPORTANCE.MINOR,
  },
  {
    spell: SPELLS.CENARION_WARD_TALENT,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 30,
    isActive: combatant => combatant.lv15Talent === SPELLS.CENARION_WARD_TALENT.id,
  },
  {
    spell: SPELLS.FLOURISH_TALENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 60,
    isActive: combatant => combatant.lv100Talent === SPELLS.FLOURISH_TALENT.id,
    recommendedCastEfficiency: 0.80,
  },
  {
    spell: SPELLS.WILD_GROWTH,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },
  {
    spell: SPELLS.REJUVENATION,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },
  {
    spell: SPELLS.INCARNATION_TREE_OF_LIFE_TALENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    isActive: combatant => combatant.lv75Talent === SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id,
    getCooldown: haste => 180
  },
  {
    spell: SPELLS.ARCANE_TORRENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    hideWithZeroCasts: true,
  },
  {
    spell: SPELLS.VELENS_FUTURE_SIGHT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 75,
    isActive: combatant => combatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id),
  },
  {
    spell: SPELLS.HEALING_TOUCH,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },
  {
    spell: SPELLS.REGROWTH,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },
];

export default CPM_ABILITIES;
