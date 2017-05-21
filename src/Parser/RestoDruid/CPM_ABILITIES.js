import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

import {
  TRANQUILITY_CAST_SPELL_ID, INNERVATE_CAST_ID, ESSENCE_OF_GHANIR_CAST_ID, IRONBARK_CAST_ID, FLOURISH_CAST_ID,
  WILD_GROWTH_HEAL_SPELL_ID, INNER_PEACE_TALENT_SPELL_ID, BARKSKIN_CAST_ID, CENARION_WARD_TALENT_SPELL_ID, FLOURISH_TALENT_SPELL_ID,
  TREE_OF_LIFE_CAST_ID, ARCANE_TORRENT_SPELL_ID, HEALING_TOUCH_HEAL_SPELL_ID, REGROWTH_HEAL_SPELL_ID, REJUVENATION_HEAL_SPELL_ID
} from './Constants';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Rotational Spell',
  COOLDOWNS: 'Cooldown',
  OTHERS: 'Spell',
};

const CPM_ABILITIES = [
  {
    spellId: TRANQUILITY_CAST_SPELL_ID,
    icon: 'spell_druid_tranquility',
    name: 'Tranquility',
    category: SPELL_CATEGORY.COOLDOWNS,
    isActive: combatant => combatant.lv90Talent === INNER_PEACE_TALENT_SPELL_ID,
    getCooldown: haste => 120,
  },
  {
    spellId: TRANQUILITY_CAST_SPELL_ID,
    icon: 'spell_druid_tranquility',
    name: 'Tranquility',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
  },
  {
    spellId: INNERVATE_CAST_ID,
    icon: 'spell_druid_innervate',
    name: 'Innervate',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
  },
  {
    spellId: ESSENCE_OF_GHANIR_CAST_ID,
    icon: 'spell_druid_essenceofghanir',
    name: 'Essence of G\'Hanir',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
  },
  {
    spellId: IRONBARK_CAST_ID,
    icon: 'spell_druid_ironbark',
    name: 'Ironbark',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    importance: ISSUE_IMPORTANCE.MINOR,
  },
  {
    spellId: BARKSKIN_CAST_ID,
    icon: 'spell_druid_barkskin',
    name: 'Barkskin',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 60,
    importance: ISSUE_IMPORTANCE.MINOR,
  },
  {
    spellId: CENARION_WARD_TALENT_SPELL_ID,
    icon: 'spell_druid_cenarionward',
    name: 'Cenarion Ward',
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 30,
    isActive: combatant => combatant.lv15Talent === CENARION_WARD_TALENT_SPELL_ID,
  },
  {
    spellId: FLOURISH_CAST_ID,
    icon: 'spell_druid_flourish',
    name: 'Flourish',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 60,
    isActive: combatant => combatant.lv100Talent === FLOURISH_TALENT_SPELL_ID,
    recommendedCastEfficiency: 0.80,
  },
  {
    spellId: WILD_GROWTH_HEAL_SPELL_ID,
    icon: 'spell_druid_wildgrowth',
    name: 'Wild Growth',
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },
  {
    spellId: REJUVENATION_HEAL_SPELL_ID,
    icon: 'spell_druid_rejuvenation',
    name: 'Rejuvenation',
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },
  {
    spellId: TREE_OF_LIFE_CAST_ID,
    icon: 'spell_druid_tol',
    name: 'Incarnation: Tree of Life',
    category: SPELL_CATEGORY.COOLDOWNS,
    isActive: combatant => combatant.lv75Talent === TREE_OF_LIFE_CAST_ID,
    getCooldown: haste => 180
  },
  {
    spellId: ARCANE_TORRENT_SPELL_ID,
    icon: 'spell_shadow_teleport',
    name: 'Arcane Torrent',
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    hideWithZeroCasts: true,
  },
  {
    spell: SPELLS.VELENS_FUTURE_SIGHT_BUFF,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 75,
    isActive: combatant => combatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT_BUFF.id),
  },
  {
    spellId: HEALING_TOUCH_HEAL_SPELL_ID,
    icon: 'spell_druid_healingtouch',
    name: 'Healing Touch',
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },
  {
    spellId: REGROWTH_HEAL_SPELL_ID,
    icon: 'spell_druid_regrowth',
    name: 'Regrowth',
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },
];

export default CPM_ABILITIES;
