import { t } from '@lingui/macro';
import indexById, { asRestrictedTable } from 'common/indexById';

import PRIMARY_STATS from './PRIMARY_STATS';
import ROLES from './ROLES';

interface BaseSpec {
  id: number;
  type?: string;
  index: number;
  className: string;
  specName?: string;
  role: number;
  primaryStat: string;
  ranking: { class: number; spec: number };
}

export interface RetailSpec extends BaseSpec {
  masterySpellId: number;
  masteryCoefficient: number;
}

export interface ClassicSpec extends BaseSpec {
  // old-style classic analyzers that haven't been ported to spec-based ones yet
  // do not have these properties
  icon?: string;
  treeIndex?: number; // which tree (0,1,2) is for this spec. used as a fallback to try to do SOMETHING
}

export type Spec = RetailSpec | ClassicSpec;

export function isRetailSpec(spec: Spec): spec is RetailSpec {
  return 'masterySpellId' in spec;
}

export function isClassicSpec(spec: Spec): spec is ClassicSpec {
  return !isRetailSpec(spec);
}

export function specMasteryCoefficient(spec: Spec | undefined): number | undefined {
  if (spec && isRetailSpec(spec)) {
    return spec.masteryCoefficient;
  } else {
    return undefined;
  }
}

const specIndexableList = asRestrictedTable<Spec>();

const SPECS = specIndexableList({
  ARCANE_MAGE: {
    id: 62,
    index: 0,
    className: t({
      id: 'specs.mage',
      message: `Mage`,
    }),
    specName: t({
      id: 'specs.mage.arcane',
      message: `Arcane`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 190740,
    masteryCoefficient: 1.2, //Max mana and mana regen is 1.2. Arcane Charge damage increase on Arcane Blast is 0.6, and on Arcane Barrage it is 0.3. Coefficient of 1 on all other arcane damage.
    ranking: {
      class: 4,
      spec: 1,
    },
  },
  FIRE_MAGE: {
    id: 63,
    index: 1,
    className: t({
      id: 'specs.mage',
      message: `Mage`,
    }),
    specName: t({
      id: 'specs.fire',
      message: `Fire`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 12846,
    masteryCoefficient: 0.75,
    ranking: {
      class: 4,
      spec: 2,
    },
  },
  FROST_MAGE: {
    id: 64,
    index: 2,
    className: t({
      id: 'specs.mage',
      message: `Mage`,
    }),
    specName: t({
      id: 'specs.frost',
      message: `Frost`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 76613,
    masteryCoefficient: 1, //This is the value shown on the character sheet. The coefficient for frozen orb is 1.9, and for icicles it is 0.019.
    ranking: {
      class: 4,
      spec: 3,
    },
  },
  HOLY_PALADIN: {
    id: 65,
    index: 3,
    className: t({
      id: 'specs.paladin',
      message: `Paladin`,
    }),
    specName: t({
      id: 'specs.holy',
      message: `Holy`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 183997,
    masteryCoefficient: 1.5, // confirmed
    ranking: {
      class: 6,
      spec: 1,
    },
  },
  PROTECTION_PALADIN: {
    id: 66,
    index: 4,
    className: t({
      id: 'specs.paladin',
      message: `Paladin`,
    }),
    specName: t({
      id: 'specs.protection',
      message: `Protection`,
    }),
    role: ROLES.TANK,
    primaryStat: PRIMARY_STATS.STRENGTH,
    masterySpellId: 76671,
    masteryCoefficient: 0.35,
    ranking: {
      class: 6,
      spec: 2,
    },
  },
  RETRIBUTION_PALADIN: {
    id: 70,
    index: 5,
    className: t({
      id: 'specs.paladin',
      message: `Paladin`,
    }),
    specName: t({
      id: 'specs.retribution',
      message: `Retribution`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.STRENGTH,
    masterySpellId: 267316,
    masteryCoefficient: 1.6,
    ranking: {
      class: 6,
      spec: 3,
    },
  },
  ARMS_WARRIOR: {
    id: 71,
    index: 6,
    className: t({
      id: 'specs.warrior',
      message: `Warrior`,
    }),
    specName: t({
      id: 'specs.arms',
      message: `Arms`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.STRENGTH,
    masterySpellId: 76838,
    masteryCoefficient: 1.1,
    ranking: {
      class: 11,
      spec: 1,
    },
  },
  FURY_WARRIOR: {
    id: 72,
    index: 7,
    className: t({
      id: 'specs.warrior',
      message: `Warrior`,
    }),
    specName: t({
      id: 'specs.fury',
      message: `Fury`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.STRENGTH,
    masterySpellId: 76856,
    masteryCoefficient: 1.4,
    ranking: {
      class: 11,
      spec: 2,
    },
  },
  PROTECTION_WARRIOR: {
    id: 73,
    index: 8,
    className: t({
      id: 'specs.warrior',
      message: `Warrior`,
    }),
    specName: t({
      id: 'specs.protection',
      message: `Protection`,
    }),
    role: ROLES.TANK,
    primaryStat: PRIMARY_STATS.STRENGTH,
    masterySpellId: 76857,
    masteryCoefficient: 1.5, //0.5 for increase block chance, 1.5 for chance to critically block and 1 for increased attack power.
    ranking: {
      class: 11,
      spec: 3,
    },
  },
  BALANCE_DRUID: {
    id: 102,
    index: 9,
    className: t({
      id: 'specs.druid',
      message: `Druid`,
    }),
    specName: t({
      id: 'specs.balance',
      message: `Balance`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 326085,
    masteryCoefficient: 1.1,
    ranking: {
      class: 2,
      spec: 1,
    },
  },
  FERAL_DRUID: {
    id: 103,
    index: 10,
    className: t({
      id: 'specs.druid',
      message: `Druid`,
    }),
    specName: t({
      id: 'specs.feral',
      message: `Feral`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.AGILITY,
    masterySpellId: 77493,
    masteryCoefficient: 2,
    ranking: {
      class: 2,
      spec: 2,
    },
  },
  GUARDIAN_DRUID: {
    id: 104,
    index: 11,
    className: t({
      id: 'specs.druid',
      message: `Druid`,
    }),
    specName: t({
      id: 'specs.guardian',
      message: `Guardian`,
    }),
    role: ROLES.TANK,
    primaryStat: PRIMARY_STATS.AGILITY,
    masterySpellId: 155783,
    masteryCoefficient: 0.5, //1 is the coef for increased attack power
    ranking: {
      class: 2,
      spec: 3,
    },
  },
  RESTORATION_DRUID: {
    id: 105,
    index: 12,
    className: t({
      id: 'specs.druid',
      message: `Druid`,
    }),
    specName: t({
      id: 'specs.restoration',
      message: `Restoration`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 77495,
    masteryCoefficient: 0.5,
    ranking: {
      class: 2,
      spec: 4,
    },
  },
  BLOOD_DEATH_KNIGHT: {
    id: 250,
    index: 13,
    className: t({
      id: 'specs.deathKnight',
      message: `Death Knight`,
    }),
    specName: t({
      id: 'specs.blood',
      message: `Blood`,
    }),
    role: ROLES.TANK,
    primaryStat: PRIMARY_STATS.STRENGTH,
    masterySpellId: 77513,
    masteryCoefficient: 2,
    ranking: {
      class: 1,
      spec: 1,
    },
  },
  FROST_DEATH_KNIGHT: {
    id: 251,
    index: 14,
    className: t({
      id: 'specs.deathKnight',
      message: `Death Knight`,
    }),
    specName: t({
      id: 'specs.frost',
      message: `Frost`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.STRENGTH,
    masterySpellId: 77514,
    masteryCoefficient: 2,
    ranking: {
      class: 1,
      spec: 2,
    },
  },
  UNHOLY_DEATH_KNIGHT: {
    id: 252,
    index: 15,
    className: t({
      id: 'specs.deathKnight',
      message: `Death Knight`,
    }),
    specName: t({
      id: 'specs.unholy',
      message: `Unholy`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.STRENGTH,
    masterySpellId: 77515,
    masteryCoefficient: 1.8,
    ranking: {
      class: 1,
      spec: 3,
    },
  },
  BEAST_MASTERY_HUNTER: {
    id: 253,
    index: 16,
    className: t({
      id: 'specs.hunter',
      message: `Hunter`,
    }),
    specName: t({
      id: 'specs.beastMastery',
      message: `Beast Mastery`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.AGILITY,
    masterySpellId: 76657,
    masteryCoefficient: 1.9,
    ranking: {
      class: 3,
      spec: 1,
    },
  },
  MARKSMANSHIP_HUNTER: {
    id: 254,
    index: 17,
    className: t({
      id: 'specs.hunter',
      message: `Hunter`,
    }),
    specName: t({
      id: 'specs.marksmanship',
      message: `Marksmanship`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.AGILITY,
    masterySpellId: 193468,
    masteryCoefficient: 0.625, // this is coeff. for the range part of the mastery, the damage part is different (1.4)
    ranking: {
      class: 3,
      spec: 2,
    },
  },
  SURVIVAL_HUNTER: {
    id: 255,
    index: 18,
    className: t({
      id: 'specs.hunter',
      message: `Hunter`,
    }),
    specName: t({
      id: 'specs.survival',
      message: `Survival`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.AGILITY,
    masterySpellId: 191334,
    masteryCoefficient: 1.65, //And a 0.1 coef for % max hp per 5 seconds
    ranking: {
      class: 3,
      spec: 3,
    },
  },
  DISCIPLINE_PRIEST: {
    id: 256,
    index: 19,
    className: t({
      id: 'specs.priest',
      message: `Priest`,
    }),
    specName: t({
      id: 'specs.discipline',
      message: `Discipline`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 271534,
    masteryCoefficient: 1.35,
    ranking: {
      class: 7,
      spec: 1,
    },
  },
  HOLY_PRIEST: {
    id: 257,
    index: 20,
    className: t({
      id: 'specs.priest',
      message: `Priest`,
    }),
    specName: t({
      id: 'specs.holy',
      message: `Holy`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 77485,
    masteryCoefficient: 1.25,
    ranking: {
      class: 7,
      spec: 2,
    },
  },
  SHADOW_PRIEST: {
    id: 258,
    index: 21,
    className: t({
      id: 'specs.priest',
      message: `Priest`,
    }),
    specName: t({
      id: 'specs.shadow',
      message: `Shadow`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 77486,
    masteryCoefficient: 0.5,
    ranking: {
      class: 7,
      spec: 3,
    },
  },
  ASSASSINATION_ROGUE: {
    id: 259,
    index: 22,
    className: t({
      id: 'specs.rogue',
      message: `Rogue`,
    }),
    specName: t({
      id: 'specs.assassination',
      message: `Assassination`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.AGILITY,
    masterySpellId: 76803,
    masteryCoefficient: 1.7,
    ranking: {
      class: 8,
      spec: 1,
    },
  },
  OUTLAW_ROGUE: {
    id: 260,
    index: 23,
    className: t({
      id: 'specs.rogue',
      message: `Rogue`,
    }),
    specName: t({
      id: 'specs.outlaw',
      message: `Outlaw`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.AGILITY,
    masterySpellId: 76806,
    masteryCoefficient: 1.45,
    ranking: {
      class: 8,
      spec: 4,
    },
  },
  SUBTLETY_ROGUE: {
    id: 261,
    index: 24,
    className: t({
      id: 'specs.rogue',
      message: `Rogue`,
    }),
    specName: t({
      id: 'specs.subtlety',
      message: `Subtlety`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.AGILITY,
    masterySpellId: 76808,
    masteryCoefficient: 2.45, // the periodic damages are modified by a coeff. of 2.76
    ranking: {
      class: 8,
      spec: 3,
    },
  },
  ELEMENTAL_SHAMAN: {
    id: 262,
    index: 25,
    className: t({
      id: 'specs.shaman',
      message: `Shaman`,
    }),
    specName: t({
      id: 'specs.elemental',
      message: `Elemental`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 168534,
    masteryCoefficient: 1.875, // confirmed
    ranking: {
      class: 9,
      spec: 1,
    },
  },
  ENHANCEMENT_SHAMAN: {
    id: 263,
    index: 26,
    className: t({
      id: 'specs.shaman',
      message: `Shaman`,
    }),
    specName: t({
      id: 'specs.enhancement',
      message: `Enhancement`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.AGILITY,
    masterySpellId: 77223,
    masteryCoefficient: 2, //proc chance coef. is 0.08
    ranking: {
      class: 9,
      spec: 2,
    },
  },
  RESTORATION_SHAMAN: {
    id: 264,
    index: 27,
    className: t({
      id: 'specs.shaman',
      message: `Shaman`,
    }),
    specName: t({
      id: 'specs.restoration',
      message: `Restoration`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 77226,
    masteryCoefficient: 3, // confirmed
    ranking: {
      class: 9,
      spec: 3,
    },
  },
  AFFLICTION_WARLOCK: {
    id: 265,
    index: 28,
    className: t({
      id: 'specs.warlock',
      message: `Warlock`,
    }),
    specName: t({
      id: 'specs.affliction',
      message: `Affliction`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 77215,
    masteryCoefficient: 2.5,
    ranking: {
      class: 10,
      spec: 1,
    },
  },
  DEMONOLOGY_WARLOCK: {
    id: 266,
    index: 29,
    className: t({
      id: 'specs.warlock',
      message: `Warlock`,
    }),
    specName: t({
      id: 'specs.demonology',
      message: `Demonology`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 77219,
    masteryCoefficient: 1.45,
    ranking: {
      class: 10,
      spec: 2,
    },
  },
  DESTRUCTION_WARLOCK: {
    id: 267,
    index: 30,
    className: t({
      id: 'specs.warlock',
      message: `Warlock`,
    }),
    specName: t({
      id: 'specs.destruction',
      message: `Destruction`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 77220,
    masteryCoefficient: 2, // reduced damage part coef. is 0.666
    ranking: {
      class: 10,
      spec: 3,
    },
  },
  BREWMASTER_MONK: {
    id: 268,
    index: 31,
    className: t({
      id: 'specs.monk',
      message: `Monk`,
    }),
    specName: t({
      id: 'specs.brewmaster',
      message: `Brewmaster`,
    }),
    role: ROLES.TANK,
    primaryStat: PRIMARY_STATS.AGILITY,
    masterySpellId: 117906,
    masteryCoefficient: 1,
    ranking: {
      class: 5,
      spec: 1,
    },
  },
  WINDWALKER_MONK: {
    id: 269,
    index: 32,
    className: t({
      id: 'specs.monk',
      message: `Monk`,
    }),
    specName: t({
      id: 'specs.windwalker',
      message: `Windwalker`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.AGILITY,
    masterySpellId: 115636,
    masteryCoefficient: 1.25,
    ranking: {
      class: 5,
      spec: 3,
    },
  },
  MISTWEAVER_MONK: {
    id: 270,
    index: 33,
    className: t({
      id: 'specs.monk',
      message: `Monk`,
    }),
    specName: t({
      id: 'specs.mistweaver',
      message: `Mistweaver`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 117907,
    masteryCoefficient: 4.2,
    ranking: {
      class: 5,
      spec: 2,
    },
  },
  HAVOC_DEMON_HUNTER: {
    id: 577,
    index: 34,
    className: t({
      id: 'specs.demonHunter',
      message: `Demon Hunter`,
    }),
    specName: t({
      id: 'specs.havoc',
      message: `Havoc`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.AGILITY,
    masterySpellId: 185164,
    masteryCoefficient: 1.8, //0.6 coefficient for movement speed
    ranking: {
      class: 12,
      spec: 1,
    },
  },
  VENGEANCE_DEMON_HUNTER: {
    id: 581,
    index: 35,
    className: t({
      id: 'specs.demonHunter',
      message: `Demon Hunter`,
    }),
    specName: t({
      id: 'specs.vengeance',
      message: `Vengeance`,
    }),
    role: ROLES.TANK,
    primaryStat: PRIMARY_STATS.AGILITY,
    masterySpellId: 203747,
    masteryCoefficient: 3, //1 for increased atk power
    ranking: {
      class: 12,
      spec: 2,
    },
  },
  DEVASTATION_EVOKER: {
    id: 1467,
    index: 36,
    className: t({
      id: 'specs.evoker',
      message: `Evoker`,
    }),
    specName: t({
      id: 'specs.devastation',
      message: 'Devastation',
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 362980,
    masteryCoefficient: 2.5,
    ranking: {
      class: 13,
      spec: 1,
    },
  },
  PRESERVATION_EVOKER: {
    id: 1468,
    index: 37,
    className: t({
      id: 'specs.evoker',
      message: `Evoker`,
    }),
    specName: t({
      id: 'specs.preservation',
      message: 'Preservation',
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 363510,
    masteryCoefficient: 1.8,
    ranking: {
      class: 13,
      spec: 2,
    },
  },

  // --------------
  // CLASSIC SPECS
  // --------------
  CLASSIC_WARRIOR_ARMS: {
    id: 161,
    index: 100,
    type: 'Warrior',
    className: t({
      id: 'specs.warrior',
      message: `Warrior`,
    }),
    specName: t({
      id: 'specs.arms',
      message: `Arms`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.STRENGTH,
    ranking: {
      class: 1,
      spec: 1,
    },
    icon: 'Warrior-Arms',
    treeIndex: 0,
  },
  CLASSIC_WARRIOR_FURY: {
    id: 164,
    index: 101,
    type: 'Warrior',
    className: t({
      id: 'specs.warrior',
      message: `Warrior`,
    }),
    specName: t({
      id: 'specs.fury',
      message: `Fury`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.STRENGTH,
    ranking: {
      class: 1,
      spec: 2,
    },
    icon: 'Warrior-Fury',
    treeIndex: 1,
  },
  CLASSIC_WARRIOR_PROTECTION: {
    id: 163,
    index: 102,
    type: 'Warrior',
    className: t({
      id: 'specs.warrior',
      message: `Warrior`,
    }),
    specName: t({
      id: 'specs.protection',
      message: `Protection`,
    }),
    role: ROLES.TANK,
    primaryStat: PRIMARY_STATS.STRENGTH,
    ranking: {
      class: 1,
      spec: 3,
    },
    icon: 'Warrior-Protection',
    treeIndex: 2,
  },
  CLASSIC_PALADIN_HOLY: {
    id: 382,
    type: 'Paladin',
    index: 103,
    className: t({
      id: 'className.paladin',
      message: `Paladin`,
    }),
    specName: t({
      id: 'specs.holy',
      message: `Holy`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STATS.INTELLECT,
    ranking: {
      class: 2,
      spec: 1,
    },
    icon: 'Paladin-Holy',
    treeIndex: 0,
  },
  CLASSIC_PALADIN_PROTECTION: {
    id: 383,
    type: 'Paladin',
    index: 104,
    className: t({
      id: 'className.paladin',
      message: `Paladin`,
    }),
    specName: t({
      id: 'specs.protection',
      message: `Protection`,
    }),
    role: ROLES.TANK,
    primaryStat: PRIMARY_STATS.STRENGTH,
    ranking: {
      class: 2,
      spec: 2,
    },
    icon: 'Paladin-Protection',
    treeIndex: 1,
  },
  CLASSIC_PALADIN_RETRIBUTION: {
    id: 381,
    type: 'Paladin',
    index: 105,
    className: t({
      id: 'className.paladin',
      message: `Paladin`,
    }),
    specName: t({
      id: 'specs.retribution',
      message: `Retribution`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.STRENGTH,
    ranking: {
      class: 2,
      spec: 3,
    },
    icon: 'Paladin-Retribution',
    treeIndex: 2,
  },
  CLASSIC_HUNTER_BEAST_MASTERY: {
    id: 361,
    type: 'Hunter',
    index: 106,
    className: t({
      id: 'className.hunter',
      message: `Hunter`,
    }),
    specName: t({
      id: 'specs.beastMastery',
      message: `Beast Mastery`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.AGILITY,
    ranking: {
      class: 3,
      spec: 1,
    },
    icon: 'Hunter-BeastMastery',
    treeIndex: 0,
  },
  CLASSIC_HUNTER_MARKSMANSHIP: {
    id: 363,
    type: 'Hunter',
    index: 107,
    className: t({
      id: 'className.hunter',
      message: `Hunter`,
    }),
    specName: t({
      id: 'specs.marksmanship',
      message: `Marksmanship`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.AGILITY,
    ranking: {
      class: 3,
      spec: 2,
    },
    icon: 'Hunter-Marksmanship',
    treeIndex: 1,
  },
  CLASSIC_HUNTER_SURVIVAL: {
    id: 362,
    type: 'Hunter',
    index: 108,
    className: t({
      id: 'className.hunter',
      message: `Hunter`,
    }),
    specName: t({
      id: 'specs.survival',
      message: `Survival`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.AGILITY,
    ranking: {
      class: 3,
      spec: 3,
    },
    icon: 'Hunter-Survival',
    treeIndex: 2,
  },
  CLASSIC_ROGUE_ASSASSINATION: {
    id: 182,
    type: 'Rogue',
    index: 109,
    className: t({
      id: 'className.rogue',
      message: `Rogue`,
    }),
    specName: t({
      id: 'specs.assassination',
      message: `Assassination`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.AGILITY,
    ranking: {
      class: 4,
      spec: 1,
    },
    icon: 'Rogue-Assassination',
    treeIndex: 0,
  },
  CLASSIC_ROGUE_COMBAT: {
    id: 181,
    type: 'Rogue',
    index: 110,
    className: t({
      id: 'className.rogue',
      message: `Rogue`,
    }),
    specName: t({
      id: 'specs.combat',
      message: `Combat`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.AGILITY,
    ranking: {
      class: 4,
      spec: 2,
    },
    icon: 'Rogue-Combat',
    treeIndex: 1,
  },
  CLASSIC_ROGUE_SUBTLETY: {
    id: 183,
    type: 'Rogue',
    index: 111,
    className: t({
      id: 'className.rogue',
      message: `Rogue`,
    }),
    specName: t({
      id: 'specs.subtlety',
      message: `Subtlety`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.AGILITY,
    ranking: {
      class: 4,
      spec: 3,
    },
    icon: 'Rogue-Subtlety',
    treeIndex: 2,
  },
  CLASSIC_PRIEST_DISCIPLINE: {
    id: 201,
    type: 'Priest',
    index: 112,
    className: t({
      id: 'className.priest',
      message: `Priest`,
    }),
    specName: t({
      id: 'specs.discipline',
      message: `Discipline`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STATS.INTELLECT,
    ranking: {
      class: 5,
      spec: 1,
    },
    icon: 'Priest-Discipline',
    treeIndex: 0,
  },
  CLASSIC_PRIEST_HOLY: {
    id: 202,
    type: 'Priest',
    index: 113,
    className: t({
      id: 'className.priest',
      message: `Priest`,
    }),
    specName: t({
      id: 'specs.holy',
      message: `Holy`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STATS.INTELLECT,
    ranking: {
      class: 5,
      spec: 2,
    },
    icon: 'Priest-Holy',
    treeIndex: 1,
  },
  CLASSIC_PRIEST_SHADOW: {
    id: 203,
    type: 'Priest',
    index: 114,
    className: t({
      id: 'className.priest',
      message: `Priest`,
    }),
    specName: t({
      id: 'specs.shadow',
      message: `Shadow`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    ranking: {
      class: 5,
      spec: 3,
    },
    icon: 'Priest-Shadow',
    treeIndex: 2,
  },
  CLASSIC_DEATH_KNIGHT_BLOOD: {
    id: 398,
    type: 'DeathKnight',
    index: 115,
    className: t({
      id: 'specs.deathKnight',
      message: `Death Knight`,
    }),
    specName: t({
      id: 'specs.blood',
      message: `Blood`,
    }),
    role: ROLES.TANK,
    primaryStat: PRIMARY_STATS.STRENGTH,
    ranking: {
      class: 6,
      spec: 1,
    },
    icon: 'DeathKnight-Blood',
    treeIndex: 0,
  },
  CLASSIC_DEATH_KNIGHT_FROST: {
    id: 399,
    type: 'DeathKnight',
    index: 116,
    className: t({
      id: 'specs.deathKnight',
      message: `Death Knight`,
    }),
    specName: t({
      id: 'specs.frost',
      message: `Frost`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.STRENGTH,
    ranking: {
      class: 6,
      spec: 2,
    },
    icon: 'DeathKnight-Frost',
    treeIndex: 1,
  },
  CLASSIC_DEATH_KNIGHT_UNHOLY: {
    id: 400,
    type: 'DeathKnight',
    index: 117,
    className: t({
      id: 'specs.deathKnight',
      message: `Death Knight`,
    }),
    specName: t({
      id: 'specs.unholy',
      message: `Unholy`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.STRENGTH,
    ranking: {
      class: 6,
      spec: 3,
    },
    icon: 'DeathKnight-Unholy',
    treeIndex: 2,
  },
  CLASSIC_SHAMAN_ELEMENTAL: {
    // wowhead id is 261 but that's the same id as retail Subtlety Rogue
    id: 2610,
    type: 'Shaman',
    index: 118,
    className: t({
      id: 'className.shaman',
      message: `Shaman`,
    }),
    specName: t({
      id: 'specs.elemental',
      message: `Elemental`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    ranking: {
      class: 7,
      spec: 1,
    },
    icon: 'Shaman-Elemental',
    treeIndex: 0,
  },
  CLASSIC_SHAMAN_ENHANCEMENT: {
    // wowhead id is 263 but that's the same id as retail Enhancement Shaman
    id: 2630,
    type: 'Shaman',
    index: 119,
    className: t({
      id: 'className.shaman',
      message: `Shaman`,
    }),
    specName: t({
      id: 'specs.enhancement',
      message: `Enhancement`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.STRENGTH,
    ranking: {
      class: 7,
      spec: 2,
    },
    icon: 'Shaman-Enhancement',
    treeIndex: 1,
  },
  CLASSIC_SHAMAN_RESTORATION: {
    // wowhead id is 262 but that's the same id as retail Restoration Shaman
    id: 2620,
    type: 'Shaman',
    index: 120,
    className: t({
      id: 'className.shaman',
      message: `Shaman`,
    }),
    specName: t({
      id: 'specs.restoration',
      message: `Restoration`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STATS.INTELLECT,
    ranking: {
      class: 7,
      spec: 3,
    },
    icon: 'Shaman-Restoration',
    treeIndex: 2,
  },
  CLASSIC_MAGE_ARCANE: {
    id: 81,
    index: 121,
    type: 'Mage',
    className: t({
      id: 'specs.mage',
      message: `Mage`,
    }),
    specName: t({
      id: 'specs.mage.arcane',
      message: `Arcane`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    ranking: {
      class: 8,
      spec: 1,
    },
    icon: 'Mage-Arcane',
    treeIndex: 0,
  },
  CLASSIC_MAGE_FIRE: {
    id: 41,
    index: 122,
    type: 'Mage',
    className: t({
      id: 'specs.mage',
      message: `Mage`,
    }),
    specName: t({
      id: 'specs.fire',
      message: `Fire`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    ranking: {
      class: 8,
      spec: 2,
    },
    icon: 'Mage-Fire',
    treeIndex: 1,
  },
  CLASSIC_MAGE_FROST: {
    id: 61,
    index: 123,
    type: 'Mage',
    className: t({
      id: 'specs.mage',
      message: `Mage`,
    }),
    specName: t({
      id: 'specs.frost',
      message: `Frost`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    ranking: {
      class: 8,
      spec: 3,
    },
    icon: 'Mage-Frost',
    treeIndex: 2,
  },
  CLASSIC_WARLOCK_AFFLICTION: {
    id: 302,
    type: 'Warlock',
    index: 124,
    className: t({
      id: 'className.warlock',
      message: `Warlock`,
    }),
    specName: t({
      id: 'specs.affliction',
      message: `Affliction`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    ranking: {
      class: 9,
      spec: 1,
    },
    icon: 'Warlock-Affliction',
    treeIndex: 0,
  },
  CLASSIC_WARLOCK_DEMONOLOGY: {
    id: 303,
    type: 'Warlock',
    index: 125,
    className: t({
      id: 'className.warlock',
      message: `Warlock`,
    }),
    specName: t({
      id: 'specs.demonology',
      message: `Demonology`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    ranking: {
      class: 9,
      spec: 2,
    },
    icon: 'Warlock-Demonology',
    treeIndex: 1,
  },
  CLASSIC_WARLOCK_DESTRUCTION: {
    id: 301,
    type: 'Warlock',
    index: 126,
    className: t({
      id: 'className.warlock',
      message: `Warlock`,
    }),
    specName: t({
      id: 'specs.destruction',
      message: `Destruction`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    ranking: {
      class: 9,
      spec: 3,
    },
    icon: 'Warlock-Destruction',
    treeIndex: 2,
  },
  CLASSIC_DRUID_BALANCE: {
    id: 283,
    type: 'Druid',
    index: 127,
    className: t({
      id: 'className.druid',
      message: `Druid`,
    }),
    specName: t({
      id: 'specs.balance',
      message: `Balance`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    ranking: {
      class: 11,
      spec: 1,
    },
    icon: 'Druid-Balance',
    treeIndex: 0,
  },
  CLASSIC_DRUID_FERAL_COMBAT: {
    id: 281,
    type: 'Druid',
    index: 128,
    className: t({
      id: 'className.druid',
      message: `Druid`,
    }),
    specName: t({
      id: 'specs.feral',
      message: `Feral`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STATS.STRENGTH,
    ranking: {
      class: 11,
      spec: 2,
    },
    icon: 'Druid-Feral',
    treeIndex: 1,
  },
  CLASSIC_DRUID_RESTORATION: {
    id: 282,
    type: 'Druid',
    index: 129,
    className: t({
      id: 'className.druid',
      message: `Druid`,
    }),
    specName: t({
      id: 'specs.restoration',
      message: `Restoration`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STATS.INTELLECT,
    ranking: {
      class: 11,
      spec: 3,
    },
    icon: 'Druid-Restoration',
    treeIndex: 2,
  },
  CLASSIC_DRUID_GUARDIAN: {
    id: 284,
    type: 'Druid',
    index: 130,
    className: t({
      id: 'className.druid',
      message: `Druid`,
    }),
    specName: t({
      id: 'specs.guardian',
      message: `Guardian`,
    }),
    role: ROLES.TANK,
    primaryStat: PRIMARY_STATS.STRENGTH,
    ranking: {
      class: 11,
      spec: 4,
    },
    icon: 'Druid-Guardian',
  },
});

export const DEATH_KNIGHT_SPECS: Spec[] = [
  SPECS.BLOOD_DEATH_KNIGHT,
  SPECS.FROST_DEATH_KNIGHT,
  SPECS.UNHOLY_DEATH_KNIGHT,
];
export const DEMON_HUNTER_SPECS: Spec[] = [SPECS.HAVOC_DEMON_HUNTER, SPECS.VENGEANCE_DEMON_HUNTER];
export const DRUID_SPECS: Spec[] = [
  SPECS.FERAL_DRUID,
  SPECS.BALANCE_DRUID,
  SPECS.GUARDIAN_DRUID,
  SPECS.RESTORATION_DRUID,
];
export const EVOKER_SPECS: Spec[] = [SPECS.DEVASTATION_EVOKER, SPECS.PRESERVATION_EVOKER];
export const HUNTER_SPECS: Spec[] = [
  SPECS.SURVIVAL_HUNTER,
  SPECS.BEAST_MASTERY_HUNTER,
  SPECS.MARKSMANSHIP_HUNTER,
];
export const MAGE_SPECS: Spec[] = [SPECS.FROST_MAGE, SPECS.FIRE_MAGE, SPECS.ARCANE_MAGE];
export const MONK_SPECS: Spec[] = [
  SPECS.MISTWEAVER_MONK,
  SPECS.BREWMASTER_MONK,
  SPECS.WINDWALKER_MONK,
];
export const PALADIN_SPECS: Spec[] = [
  SPECS.PROTECTION_PALADIN,
  SPECS.RETRIBUTION_PALADIN,
  SPECS.HOLY_PALADIN,
];
export const PRIEST_SPECS: Spec[] = [
  SPECS.HOLY_PRIEST,
  SPECS.DISCIPLINE_PRIEST,
  SPECS.SHADOW_PRIEST,
];
export const ROGUE_SPECS: Spec[] = [
  SPECS.SUBTLETY_ROGUE,
  SPECS.OUTLAW_ROGUE,
  SPECS.ASSASSINATION_ROGUE,
];
export const SHAMAN_SPECS: Spec[] = [
  SPECS.ELEMENTAL_SHAMAN,
  SPECS.ENHANCEMENT_SHAMAN,
  SPECS.RESTORATION_SHAMAN,
];
export const WARLOCK_SPECS: Spec[] = [
  SPECS.DESTRUCTION_WARLOCK,
  SPECS.DEMONOLOGY_WARLOCK,
  SPECS.AFFLICTION_WARLOCK,
];
export const WARRIOR_SPECS: Spec[] = [
  SPECS.ARMS_WARRIOR,
  SPECS.PROTECTION_WARRIOR,
  SPECS.FURY_WARRIOR,
];

// --------------
// CLASSIC SPECS
// --------------
export const CLASSIC_WARRIOR_SPECS: Spec[] = [
  SPECS.CLASSIC_WARRIOR_ARMS,
  SPECS.CLASSIC_WARRIOR_FURY,
  SPECS.CLASSIC_WARRIOR_PROTECTION,
];
export const CLASSIC_PALADIN_SPECS: Spec[] = [
  SPECS.CLASSIC_PALADIN_HOLY,
  SPECS.CLASSIC_PALADIN_PROTECTION,
  SPECS.CLASSIC_PALADIN_RETRIBUTION,
];
export const CLASSIC_HUNTER_SPECS: Spec[] = [
  SPECS.CLASSIC_HUNTER_BEAST_MASTERY,
  SPECS.CLASSIC_HUNTER_MARKSMANSHIP,
  SPECS.CLASSIC_HUNTER_SURVIVAL,
];
export const CLASSIC_ROGUE_SPECS: Spec[] = [
  SPECS.CLASSIC_ROGUE_ASSASSINATION,
  SPECS.CLASSIC_ROGUE_COMBAT,
  SPECS.CLASSIC_ROGUE_SUBTLETY,
];
export const CLASSIC_PRIEST_SPECS: Spec[] = [
  SPECS.CLASSIC_PRIEST_DISCIPLINE,
  SPECS.CLASSIC_PRIEST_HOLY,
  SPECS.CLASSIC_PRIEST_SHADOW,
];
export const CLASSIC_DEATH_KNIGHT_SPECS: Spec[] = [
  SPECS.CLASSIC_DEATH_KNIGHT_BLOOD,
  SPECS.CLASSIC_DEATH_KNIGHT_FROST,
  SPECS.CLASSIC_DEATH_KNIGHT_UNHOLY,
];
export const CLASSIC_SHAMAN_SPECS: Spec[] = [
  SPECS.CLASSIC_SHAMAN_ELEMENTAL,
  SPECS.CLASSIC_SHAMAN_ENHANCEMENT,
  SPECS.CLASSIC_SHAMAN_RESTORATION,
];
export const CLASSIC_MAGE_SPECS: Spec[] = [
  SPECS.CLASSIC_MAGE_ARCANE,
  SPECS.CLASSIC_MAGE_FIRE,
  SPECS.CLASSIC_MAGE_FROST,
];
export const CLASSIC_WARLOCK_SPECS: Spec[] = [
  SPECS.CLASSIC_WARLOCK_AFFLICTION,
  SPECS.CLASSIC_WARLOCK_DEMONOLOGY,
  SPECS.CLASSIC_WARLOCK_DESTRUCTION,
];
export const CLASSIC_DRUID_SPECS: Spec[] = [
  SPECS.CLASSIC_DRUID_BALANCE,
  SPECS.CLASSIC_DRUID_FERAL_COMBAT,
  SPECS.CLASSIC_DRUID_RESTORATION,
  SPECS.CLASSIC_DRUID_GUARDIAN,
];

export const specsCount = Object.keys(SPECS).length;
export default indexById<Spec, typeof SPECS>(SPECS);
