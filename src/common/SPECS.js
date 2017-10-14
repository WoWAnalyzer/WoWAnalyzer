import indexById from './indexById';

import ROLES from './ROLES';

const SPECS = {
  ARCANE_MAGE: { id: 62, className: 'Mage', specName: 'Arcane', role: ROLES.DPS.RANGED },
  FIRE_MAGE: { id: 63, className: 'Mage', specName: 'Fire', role: ROLES.DPS.RANGED },
  FROST_MAGE: { id: 64, className: 'Mage', specName: 'Frost', role: ROLES.DPS.RANGED },
  HOLY_PALADIN: { id: 65, className: 'Paladin', specName: 'Holy', role: ROLES.HEALER },
  PROTECTION_PALADIN: { id: 66, className: 'Paladin', specName: 'Protection', role: ROLES.TANK },
  RETRIBUTION_PALADIN: { id: 70, className: 'Paladin', specName: 'Retribution', role: ROLES.DPS.MELEE },
  ARMS_WARRIOR: { id: 71, className: 'Warrior', specName: 'Arms', role: ROLES.DPS.MELEE },
  FURY_WARRIOR: { id: 72, className: 'Warrior', specName: 'Fury', role: ROLES.DPS.MELEE },
  PROTECTION_WARRIOR: { id: 73, className: 'Warrior', specName: 'Protection', role: ROLES.TANK },
  BALANCE_DRUID: { id: 102, className: 'Druid', specName: 'Balance', role: ROLES.DPS.RANGED },
  FERAL_DRUID: { id: 103, className: 'Druid', specName: 'Feral', role: ROLES.DPS.MELEE },
  GUARDIAN_DRUID: { id: 104, className: 'Druid', specName: 'Guardian', role: ROLES.TANK },
  RESTORATION_DRUID: { id: 105, className: 'Druid', specName: 'Restoration', role: ROLES.HEALER },
  BLOOD_DEATH_KNIGHT: { id: 250, className: 'Death Knight', specName: 'Blood', role: ROLES.TANK },
  FROST_DEATH_KNIGHT: { id: 251, className: 'Death Knight', specName: 'Frost', role: ROLES.DPS.MELEE },
  UNHOLY_DEATH_KNIGHT: { id: 252, className: 'Death Knight', specName: 'Unholy', role: ROLES.DPS.MELEE },
  BEAST_MASTERY_HUNTER: { id: 253, className: 'Hunter', specName: 'Beast Mastery', role: ROLES.DPS.RANGED },
  MARKSMANSHIP_HUNTER: { id: 254, className: 'Hunter', specName: 'MarksmanshipHunter', role: ROLES.DPS.RANGED },
  SURVIVAL_HUNTER: { id: 255, className: 'Hunter', specName: 'Survival', role: ROLES.DPS.MELEE },
  DISCIPLINE_PRIEST: { id: 256, className: 'Priest', specName: 'Discipline', role: ROLES.HEALER },
  HOLY_PRIEST: { id: 257, className: 'Priest', specName: 'Holy', role: ROLES.HEALER },
  SHADOW_PRIEST: { id: 258, className: 'Priest', specName: 'Shadow', role: ROLES.DPS.RANGED },
  ASSASSINATION_ROGUE: { id: 259, className: 'Rogue', specName: 'Assassination', role: ROLES.DPS.MELEE },
  OUTLAW_ROGUE: { id: 260, className: 'Rogue', specName: 'Outlaw', role: ROLES.DPS.MELEE },
  SUBTLETY_ROGUE: { id: 261, className: 'Rogue', specName: 'Subtlety', role: ROLES.DPS.MELEE },
  ELEMENTAL_SHAMAN: { id: 262, className: 'Shaman', specName: 'Elemental', role: ROLES.DPS.RANGED },
  ENHANCEMENT_SHAMAN: { id: 263, className: 'Shaman', specName: 'Enhancement', role: ROLES.DPS.MELEE },
  RESTORATION_SHAMAN: { id: 264, className: 'Shaman', specName: 'Restoration', role: ROLES.HEALER },
  AFFLICTION_WARLOCK: { id: 265, className: 'Warlock', specName: 'Affliction', role: ROLES.DPS.RANGED },
  DEMONOLOGY_WARLOCK: { id: 266, className: 'Warlock', specName: 'Demonology', role: ROLES.DPS.RANGED },
  DESTRUCTION_WARLOCK: { id: 267, className: 'Warlock', specName: 'Destruction', role: ROLES.DPS.RANGED },
  BREWMASTER_MONK: { id: 268, className: 'Monk', specName: 'Brewmaster', role: ROLES.TANK },
  WINDWALKER_MONK: { id: 269, className: 'Monk', specName: 'Windwalker', role: ROLES.DPS.MELEE },
  MISTWEAVER_MONK: { id: 270, className: 'Monk', specName: 'Mistweaver', role: ROLES.HEALER },
  HAVOC_DEMON_HUNTER: { id: 577, className: 'Demon Hunter', specName: 'Havoc', role: ROLES.DPS.MELEE },
  VENGEANCE_DEMON_HUNTER: { id: 581, className: 'Demon Hunter', specName: 'Vengeance', role: ROLES.TANK },
};

export default indexById(SPECS);
