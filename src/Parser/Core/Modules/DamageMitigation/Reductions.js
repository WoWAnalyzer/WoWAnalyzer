import SPELLS from 'common/SPELLS';
import MAGIC_SCHOOLS from 'common/MAGIC_SCHOOLS';
import SPECS from 'Game/SPECS';
import RACES from 'Game/RACES';

import AOE_TYPE from './AOE_TYPE';

// Damage reductions that are buffs on the player
export const BUFFS = [
  // Death Knight
  {
    id: SPELLS.ICEBOUND_FORTITUDE.id,
    name: SPELLS.ICEBOUND_FORTITUDE.name,
    mitigation: 0.3,
  },
  {
    id: SPELLS.RUNE_TAP_TALENT.id,
    name: SPELLS.RUNE_TAP_TALENT.name,
    mitigation: 0.3,
  },
  // Demon Hunter
  {
    id: SPELLS.BLUR_BUFF.id,
    name: SPELLS.BLUR_BUFF.name,
    mitigation: (armor, versatility, mastery, avoidance, combatant) => {
      return combatant.hasTalent(SPELLS.DESPERATE_INSTINCTS_TALENT.id) ? 0.5 : 0.35;
    },
  },
  // Druid
  {
    id: SPELLS.BARKSKIN.id,
    name: SPELLS.BARKSKIN.name,
    mitigation: 0.2,
  },
  {
    id: SPELLS.SURVIVAL_INSTINCTS.id,
    name: SPELLS.SURVIVAL_INSTINCTS.name,
    mitigation: 0.5,
  },
  {
    id: SPELLS.PULVERIZE_TALENT.id,
    name: SPELLS.PULVERIZE_TALENT.name,
    mitigation: 0.09,
  },
  {
    id: SPELLS.IRONBARK.id,
    name: SPELLS.IRONBARK.name,
    mitigation: 0.2,
  },
  // Hunter
  {
    id: SPELLS.ASPECT_OF_THE_TURTLE.id,
    name: SPELLS.ASPECT_OF_THE_TURTLE.name,
    mitigation: 0.3,
  },
  {
    id: SPELLS.SURVIVAL_OF_THE_FITTEST_BUFF.id,
    name: SPELLS.SURVIVAL_OF_THE_FITTEST_BUFF.name,
    mitigation: 0.2,
  },
  // Mage
  // Monk
  {
    id: SPELLS.FORTIFYING_BREW.id,
    name: SPELLS.FORTIFYING_BREW.name,
    mitigation: 0.2,
  },
  {
    id: SPELLS.FORTIFYING_BREW_BRM_BUFF.id,
    name: SPELLS.FORTIFYING_BREW_BRM_BUFF.name,
    mitigation: 0.2,
  },
  {
    id: SPELLS.DAMPEN_HARM_TALENT.id,
    name: SPELLS.DAMPEN_HARM_TALENT.name,
    mitigation: 0.2, //between 0.2 and 0.5 depending on the size of the hit
  },
  // Paladin
  {
    id: SPELLS.DIVINE_PROTECTION.id,
    name: SPELLS.DIVINE_PROTECTION.name,
    mitigation: 0.2,
  },
  {
    id: SPELLS.AEGIS_OF_LIGHT_TALENT.id,
    name: SPELLS.AEGIS_OF_LIGHT_TALENT.name,
    mitigation: 0.2,
  },
  {
    id: SPELLS.GUARDIAN_OF_ANCIENT_KINGS.id,
    name: SPELLS.GUARDIAN_OF_ANCIENT_KINGS.name,
    mitigation: 0.5,
  },
  {
    id: SPELLS.ARDENT_DEFENDER.id,
    name: SPELLS.ARDENT_DEFENDER.name,
    mitigation: 0.2,
  },
  {
    id: SPELLS.EYE_FOR_AN_EYE_TALENT.id,
    name: SPELLS.EYE_FOR_AN_EYE_TALENT.name,
    mitigation: 0.35,
    school: [MAGIC_SCHOOLS.ids.PHYSICAL],
  },
  {
    id: SPELLS.MASTERY_DIVINE_BULWARK.id,
    name: SPELLS.MASTERY_DIVINE_BULWARK.name,
    buffId: SPELLS.CONSECRATION_BUFF.id,
    mitigation: (armor, versatility, mastery) => {
      return mastery;
    },
    enabled: combatant => combatant.specId === SPECS.PROTECTION_PALADIN.id,
  },
  // Priest
  {
    id: SPELLS.DISPERSION.id,
    name: SPELLS.DISPERSION.name,
    mitigation: 0.6,
  },
  {
    id: SPELLS.POWER_WORD_BARRIER_BUFF.id,
    name: SPELLS.POWER_WORD_BARRIER_BUFF.name,
    mitigation: 0.25,
  },
  {
    id: SPELLS.PAIN_SUPPRESSION.id,
    name: SPELLS.PAIN_SUPPRESSION.name,
    mitigation: 0.4,
  },
  {
    id: SPELLS.MASOCHISM_TALENT.id,
    name: SPELLS.MASOCHISM_TALENT.name,
    mitigation: 0.1,
  },
  {
    id: SPELLS.PERSEVERANCE_TALENT.id,
    name: SPELLS.PERSEVERANCE_TALENT.name,
    buffId: SPELLS.RENEW.id,
    mitigation: 0.1,
    enabled: combatant => combatant.hasTalent(SPELLS.PERSEVERANCE_TALENT.id),
  },
  {
    id: SPELLS.LENIENCE_TALENT.id,
    name: SPELLS.LENIENCE_TALENT.name,
    buffId: SPELLS.ATONEMENT_BUFF.id,
    mitigation: 0.03,
  },
  // Rogue
  {
    id: SPELLS.FEINT.id,
    name: SPELLS.FEINT.name,
    mitigation: 0.4,
    aoe: AOE_TYPE.AOE_ONLY,
  },
  {
    id: SPELLS.ELUSIVENESS_TALENT.id,
    name: SPELLS.ELUSIVENESS_TALENT.name,
    buffId: SPELLS.FEINT.id,
    mitigation: 0.3,
    enabled: combatant => combatant.hasTalent(SPELLS.ELUSIVENESS_TALENT.id),
    aoe: AOE_TYPE.NON_AOE_ONLY,
  },
  // Shaman  
  {
    id: SPELLS.ASTRAL_SHIFT.id,
    name: SPELLS.ASTRAL_SHIFT.name,
    mitigation: 0.4,
  },
  {
    id: SPELLS.HARDEN_SKIN.id,
    name: SPELLS.HARDEN_SKIN.name,
    mitigation: 0.4,
  },
  {
    id: SPELLS.SPIRIT_WOLF_BUFF.id,
    name: SPELLS.SPIRIT_WOLF_BUFF.name,
    mitigation: 0.05,
  },
  // Warlock
  {
    id: SPELLS.UNENDING_RESOLVE.id,
    name: SPELLS.UNENDING_RESOLVE.name,
    mitigation: 0.4,
  },
  // Warrior
  {
    id: SPELLS.DIE_BY_THE_SWORD.id,
    name: SPELLS.DIE_BY_THE_SWORD.name,
    mitigation: 0.3,
  },
  {
    id: SPELLS.DEFENSIVE_STANCE_TALENT.id,
    name: SPELLS.DEFENSIVE_STANCE_TALENT.name,
    mitigation: 0.2,
  },
  {
    id: SPELLS.ENRAGED_REGENERATION.id,
    name: SPELLS.ENRAGED_REGENERATION.name,
    mitigation: 0.3,
  },
  {
    id: SPELLS.WARPAINT_TALENT.id,
    name: SPELLS.WARPAINT_TALENT.name,
    buffId: SPELLS.ENRAGE.id,
    mitigation: 0.1,
    enabled: combatant => combatant.hasTalent(SPELLS.WARPAINT_TALENT.id),
  },
  {
    id: SPELLS.SHIELD_WALL.id,
    name: SPELLS.SHIELD_WALL.name,
    mitigation: 0.4,
  },
  {
    id: SPELLS.SPELL_REFLECTION.id,
    name: SPELLS.SPELL_REFLECTION.name,
    mitigation: 0.2,
    school: [0],
  },
  // Racials
  {
    id: SPELLS.STONEFORM.id,
    name: SPELLS.STONEFORM.name,
    mitigation: 0.1,
    school: [MAGIC_SCHOOLS.ids.PHYSICAL],
  },
];

// Damage reductions that are debuffs on the source target (applied by the player)
export const DEBUFFS = [
  // Global
  // Death Knight
  // Demon Hunter
  {
    id: SPELLS.FIERY_BRAND_DEBUFF.id,
    name: SPELLS.FIERY_BRAND_DEBUFF.name,
    mitigation: 0.4,
  },
  {
    id: SPELLS.VOID_REAVER_DEBUFF.id,
    name: SPELLS.VOID_REAVER_DEBUFF.name,
    mitigation: 0.06,
  },
  // Druid
  {
    id: SPELLS.REND_AND_TEAR_TALENT.id,
    name: SPELLS.REND_AND_TEAR_TALENT.name,
    buffId: SPELLS.THRASH_BEAR_DOT.id,
    mitigation: 0.02,
    enabled: combatant => combatant.hasTalent(SPELLS.REND_AND_TEAR_TALENT.id),
  },
  // Hunter
  // Mage
  // Monk
  {
    id: SPELLS.BREATH_OF_FIRE_DEBUFF.id,
    name: SPELLS.BREATH_OF_FIRE_DEBUFF.name,
    mitigation: 0.05,
  },
  // Paladin
  // Priest
  // Rogue
  // Shaman  
  // Warlock
  // Warrior
  {
    id: SPELLS.DEMORALIZING_SHOUT.id,
    name: SPELLS.DEMORALIZING_SHOUT.name,
    mitigation: 0.2,
  },
  {
    id: SPELLS.PUNISH_DEBUFF.id,
    name: SPELLS.PUNISH_DEBUFF.name,
    mitigation: 0.03,
  },
  // Racials
];

// Damage reductions that are passive and has a static value
export const PASSIVES = [
  // Global
  {
    id: -1001,
    name: 'Armor',
    mitigation: armor => {
      return armor;
    },
    school: [MAGIC_SCHOOLS.ids.PHYSICAL],
  },
  {
    id: -1002,
    name: 'Versatility',
    mitigation: (armor, versatility) => {
      return versatility / 2;
    },
  },
  {
    id: -1003,
    name: 'Avoidance',
    mitigation: (armor, versatility, mastery, avoidance, combatant) => {
      return avoidance;
    },
    aoe: AOE_TYPE.AOE_ONLY,
  },
  // Death Knight
  // Demon Hunter
  {
    id: SPELLS.DEMONIC_WARDS.id,
    name: SPELLS.DEMONIC_WARDS.name,
    mitigation: 0.1,
    enabled: combatant => combatant.specId === SPECS.HAVOC_DEMON_HUNTER.id,
    school: [0],
  },
  {
    id: SPELLS.DEMONIC_WARDS.id,
    name: SPELLS.DEMONIC_WARDS.name,
    mitigation: 0.1,
    enabled: combatant => combatant.specId === SPECS.VENGEANCE_DEMON_HUNTER.id,
  },
  // Druid
  {
    id: SPELLS.THICK_HIDE.id,
    name: SPELLS.THICK_HIDE.name,
    mitigation: 0.06,
    enabled: combatant => combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_SHARED.id) || 
                          combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_FERAL.id) || 
                          combatant.specId === SPECS.GUARDIAN_DRUID.id,
  },
  // Hunter
  // Mage
  // Monk
  // Paladin
  // Priest
  // Rogue
  // Shaman
  // Warlock
  // Warrior
  // Racials
  {
    id: SPELLS.RUGGED_TENACITY.id,
    name: SPELLS.RUGGED_TENACITY.name,
    mitigation: (armor, versatility, mastery, avoidance, combatant) => {
      return 0; // Need to figure out how this works. Likely works like block.
    },
    enabled: (combatant) => combatant.owner.characterProfile ? (combatant.owner.characterProfile.race === RACES.HighmountainTauren.id) : false,
  },
  {
    id: SPELLS.FORGED_IN_FLAMES.id,
    name: SPELLS.FORGED_IN_FLAMES.name,
    mitigation: 0.01,
    enabled: (combatant) => combatant.owner.characterProfile ? (combatant.owner.characterProfile.race === RACES.DarkIronDwarf.id) : false,
    school: [MAGIC_SCHOOLS.ids.PHYSICAL],
  },
  {
    id: SPELLS.HOLY_RESISTANCE_LIGHTFORGED.id,
    name: SPELLS.HOLY_RESISTANCE_LIGHTFORGED.name,
    mitigation: 0.01,
    enabled: (combatant) => combatant.owner.characterProfile ? (combatant.owner.characterProfile.race === RACES.LightforgedDraenei.id) : false,
    school: [MAGIC_SCHOOLS.ids.HOLY],
  },
  {
    id: SPELLS.ARCANE_RESISTANCE_BLOOD_ELF.id,
    name: SPELLS.ARCANE_RESISTANCE_BLOOD_ELF.name,
    mitigation: 0.01,
    enabled: (combatant) => combatant.owner.characterProfile ? (combatant.owner.characterProfile.race === RACES.BloodElf.id) : false,
    school: [MAGIC_SCHOOLS.ids.ARCANE],
  },
  {
    id: SPELLS.ARCANE_RESISTANCE_NIGHTBORNE.id,
    name: SPELLS.ARCANE_RESISTANCE_NIGHTBORNE.name,
    mitigation: 0.01,
    enabled: (combatant) => combatant.owner.characterProfile ? (combatant.owner.characterProfile.race === RACES.Nightborne.id) : false,
    school: [MAGIC_SCHOOLS.ids.ARCANE],
  },
  {
    id: SPELLS.ARCANE_RESISTANCE_GNOME.id,
    name: SPELLS.ARCANE_RESISTANCE_GNOME.name,
    mitigation: 0.01,
    enabled: (combatant) => combatant.owner.characterProfile ? (combatant.owner.characterProfile.race === RACES.Gnome.id) : false,
    school: [MAGIC_SCHOOLS.ids.ARCANE],
  },
  {
    id: SPELLS.SHADOW_RESISTANCE_DRAENEI.id,
    name: SPELLS.SHADOW_RESISTANCE_DRAENEI.name,
    mitigation: 0.01,
    enabled: (combatant) => combatant.owner.characterProfile ? (combatant.owner.characterProfile.race === RACES.Draenei.id) : false,
    school: [MAGIC_SCHOOLS.ids.SHADOW],
  },
  {
    id: SPELLS.SHADOW_RESISTANCE_UNDEAD.id,
    name: SPELLS.SHADOW_RESISTANCE_UNDEAD.name,
    mitigation: 0.01,
    enabled: (combatant) => combatant.owner.characterProfile ? (combatant.owner.characterProfile.race === RACES.Undead.id) : false,
    school: [MAGIC_SCHOOLS.ids.SHADOW],
  },
  {
    id: SPELLS.CHILL_OF_NIGHT.id,
    name: SPELLS.CHILL_OF_NIGHT.name,
    mitigation: 0.01,
    enabled: (combatant) => combatant.owner.characterProfile ? (combatant.owner.characterProfile.race === RACES.VoidElf.id) : false,
    school: [MAGIC_SCHOOLS.ids.SHADOW],
  },
  {
    id: SPELLS.FROST_RESISTANCE_DWARF.id,
    name: SPELLS.FROST_RESISTANCE_DWARF.name,
    mitigation: 0.01,
    enabled: (combatant) => combatant.owner.characterProfile ? (combatant.owner.characterProfile.race === RACES.Dwarf.id) : false,
    school: [MAGIC_SCHOOLS.ids.FROST],
  },
  {
    id: SPELLS.NATURE_RESISTANCE_NIGHT_ELF.id,
    name: SPELLS.NATURE_RESISTANCE_NIGHT_ELF.name,
    mitigation: 0.01,
    enabled: (combatant) => combatant.owner.characterProfile ? (combatant.owner.characterProfile.race === RACES.NightElf.id) : false,
    school: [MAGIC_SCHOOLS.ids.NATURE],
  },
  {
    id: SPELLS.NATURE_RESISTANCE_TAUREN.id,
    name: SPELLS.NATURE_RESISTANCE_TAUREN.name,
    mitigation: 0.01,
    enabled: (combatant) => combatant.owner.characterProfile ? (combatant.owner.characterProfile.race === RACES.Tauren.id) : false,
    school: [MAGIC_SCHOOLS.ids.NATURE],
  },
  {
    id: SPELLS.ABERRATION.id,
    name: SPELLS.ABERRATION.name,
    mitigation: 0.01,
    enabled: (combatant) => combatant.owner.characterProfile ? (combatant.owner.characterProfile.race === RACES.Worgen.id) : false,
    school: [MAGIC_SCHOOLS.ids.NATURE, MAGIC_SCHOOLS.ids.SHADOW, MAGIC_SCHOOLS.ids.NATURE + MAGIC_SCHOOLS.ids.SHADOW],
  },
];

// Any missing damage mitigation is contributed to "Unknown"
export const UNKNOWN = 
{
  id: -1000,
  name: 'Unknown',
};

export const AURA_OF_SACRIFICE = 
{
  id: SPELLS.AURA_OF_SACRIFICE_BUFF.id,
  name: SPELLS.AURA_OF_SACRIFICE_BUFF.name,
  mitigation: 0.1,
};
