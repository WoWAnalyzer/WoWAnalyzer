import SPELLS from 'common/SPELLS';
import SPECS from 'common/SPECS';

// Damage reductions that are buffs and has a static value
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
    id: SPELLS.BLUR.id,
    name: SPELLS.BLUR.name,
    mitigation: (armor, versatility, mastery, combatant) => {
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
    id: SPELLS.RENEW.id,
    name: SPELLS.RENEW.name,
    mitigation: 0.1,
    enabled: combatant => {
      return combatant.hasTalent(SPELLS.PERSEVERANCE_TALENT.id);
    },
  },
  {
    id: SPELLS.LENIENCE_TALENT.id,
    name: SPELLS.LENIENCE_TALENT.name,
    mitigation: 0.03,
  },
  // Rogue
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
    id: SPELLS.ENRAGE.id,
    name: SPELLS.ENRAGE.name,
    mitigation: 0.1,
    enabled: combatant => {
      return combatant.hasTalent(SPELLS.WARPAINT_TALENT.id)
    }
  },
  {
    id: SPELLS.SHIELD_WALL.id,
    name: SPELLS.SHIELD_WALL.name,
    mitigation: 0.4,
  },
];

// Damage reductions that are passive and has a static value
export const PASSIVES = [
  // Global
  {
    id: -1002,
    name: 'Versatility',
    mitigation: (armor, versatility) => {
      return versatility / 2;
    },
  },
  // Death Knight
  // Demon Hunter
  {
    id: SPELLS.DEMONIC_WARDS.id,
    name: SPELLS.DEMONIC_WARDS.name,
    mitigation: 0.1,
    enabled: combatant => {
      return (combatant.specId === SPECS.HAVOC_DEMON_HUNTER.id ||
      combatant.specId === SPECS.VENGEANCE_DEMON_HUNTER.id);
    },
  },
  // Druid
  {
    id: SPELLS.THICK_HIDE.id,
    name: SPELLS.THICK_HIDE.name,
    mitigation: 0.06,
    enabled: combatant => {
      return (combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_SHARED.id) || 
      combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_FERAL.id) || 
      combatant.specId === SPECS.GUARDIAN_DRUID.id);
    },
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
];

// Some of these are not abilities so they are given fake IDs. They will also need icons.

// Any missing damage mitigation is contributed to "Unknown"
export const UNKNOWN = 
{
  id: -1000,
  name: 'Unknown',
};

export const ARMOR = 
{
  id: -1001,
  name: 'Armor',
  mitigation: armor => {
    return armor;
  },
};

// Paladin and Destruction Warlock mastery.
export const MASTERY = 
{
  id: -1003,
  name: 'Mastery',
};

// Avoidance needs a whitelist.
export const AVOIDANCE = 
{
  id: -1004,
  name: 'Avoidance',
};
