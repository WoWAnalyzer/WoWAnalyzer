import SPELLS from 'common/SPELLS';

// Damage reductions that are buffs and has a static value
export const STATIC_BUFFS = [
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
    id: SPELLS.SURVIVAL_OF_THE_FITTEST.id,
    name: SPELLS.SURVIVAL_OF_THE_FITTEST.name,
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
    id: SPELLS.SHIELD_WALL.id,
    name: SPELLS.SHIELD_WALL.name,
    mitigation: 0.4,
  },
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
    return armor; // K value is 6300 for lv 120-123, 2107 for lv 113, 1423 for lv 110.
  },
};

export const VERSATILITY = 
{
  id: -1002,
  name: 'Versatility',
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
