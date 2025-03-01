import { defineMessage } from '@lingui/macro';
import indexById from 'common/indexById';

import { PRIMARY_STAT } from 'parser/shared/modules/features/STAT';
import ROLES from './ROLES';
import { MessageDescriptor } from '@lingui/core';
import GameBranch from './GameBranch';
import { TIMEWALKER_MASTERY_COEFFICIENT } from 'analysis/retail/evoker/augmentation/constants';

interface BaseSpec {
  id: number;
  type?: string;
  index: number;
  className: MessageDescriptor;
  specName?: MessageDescriptor;
  role: number;
  primaryStat: PRIMARY_STAT;
  ranking: { class: number; spec: number };
  /**
   * String key used by WCL to identify the class.
   */
  wclClassName: string;
  /**
   * String key used by WCL to identify the spec.
   */
  wclSpecName: string;
  branch: GameBranch;
  masterySpellId?: number;
  masteryCoefficient?: number;
}

export interface RetailSpec extends BaseSpec {}

interface ClassicSpec extends BaseSpec {
  icon: string;
  treeIndex?: number; // which tree (0,1,2) is for this spec. used as a fallback to try to do SOMETHING
}

export type Spec = RetailSpec | ClassicSpec;

export function isRetailSpec(spec: Spec): spec is RetailSpec {
  return spec.branch === GameBranch.Retail;
}

export function isClassicSpec(spec: Spec): spec is ClassicSpec {
  return spec.branch === GameBranch.Classic;
}

const SPECS = {
  ARCANE_MAGE: {
    id: 62,
    index: 0,
    className: defineMessage({
      id: 'specs.mage',
      message: `Mage`,
    }),
    specName: defineMessage({
      id: 'specs.mage.arcane',
      message: `Arcane`,
    }),
    wclClassName: 'Mage',
    wclSpecName: 'Arcane',
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 190740,
    masteryCoefficient: 1.2, //Max mana and mana regen is 1.2. Arcane Charge damage increase on Arcane Blast is 0.6, and on Arcane Barrage it is 0.3. Coefficient of 1 on all other arcane damage.
    branch: GameBranch.Retail,
    ranking: {
      class: 4,
      spec: 1,
    },
  },
  FIRE_MAGE: {
    id: 63,
    index: 1,
    className: defineMessage({
      id: 'specs.mage',
      message: `Mage`,
    }),
    specName: defineMessage({
      id: 'specs.fire',
      message: `Fire`,
    }),
    wclClassName: 'Mage',
    wclSpecName: 'Fire',
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 12846,
    masteryCoefficient: 0.75,
    branch: GameBranch.Retail,
    ranking: {
      class: 4,
      spec: 2,
    },
  },
  FROST_MAGE: {
    id: 64,
    index: 2,
    className: defineMessage({
      id: 'specs.mage',
      message: `Mage`,
    }),
    specName: defineMessage({
      id: 'specs.frost',
      message: `Frost`,
    }),
    wclClassName: 'Mage',
    wclSpecName: 'Frost',
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 76613,
    masteryCoefficient: 1, //This is the value shown on the character sheet. The coefficient for frozen orb is 1.9, and for icicles it is 0.019.
    branch: GameBranch.Retail,
    ranking: {
      class: 4,
      spec: 3,
    },
  },
  HOLY_PALADIN: {
    id: 65,
    index: 3,
    className: defineMessage({
      id: 'specs.paladin',
      message: `Paladin`,
    }),
    specName: defineMessage({
      id: 'specs.holy',
      message: `Holy`,
    }),
    wclClassName: 'Paladin',
    wclSpecName: 'Holy',
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 183997,
    masteryCoefficient: 1.5, // confirmed
    branch: GameBranch.Retail,
    ranking: {
      class: 6,
      spec: 1,
    },
  },
  PROTECTION_PALADIN: {
    id: 66,
    index: 4,
    className: defineMessage({
      id: 'specs.paladin',
      message: `Paladin`,
    }),
    specName: defineMessage({
      id: 'specs.protection',
      message: `Protection`,
    }),
    wclClassName: 'Paladin',
    wclSpecName: 'Protection',
    role: ROLES.TANK,
    primaryStat: PRIMARY_STAT.STRENGTH,
    masterySpellId: 76671,
    masteryCoefficient: 0.35,
    branch: GameBranch.Retail,
    ranking: {
      class: 6,
      spec: 2,
    },
  },
  RETRIBUTION_PALADIN: {
    id: 70,
    index: 5,
    className: defineMessage({
      id: 'specs.paladin',
      message: `Paladin`,
    }),
    specName: defineMessage({
      id: 'specs.retribution',
      message: `Retribution`,
    }),
    wclClassName: 'Paladin',
    wclSpecName: 'Retribution',
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.STRENGTH,
    masterySpellId: 267316,
    masteryCoefficient: 1.6,
    branch: GameBranch.Retail,
    ranking: {
      class: 6,
      spec: 3,
    },
  },
  ARMS_WARRIOR: {
    id: 71,
    index: 6,
    className: defineMessage({
      id: 'specs.warrior',
      message: `Warrior`,
    }),
    specName: defineMessage({
      id: 'specs.arms',
      message: `Arms`,
    }),
    wclClassName: 'Warrior',
    wclSpecName: 'Arms',
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.STRENGTH,
    masterySpellId: 76838,
    masteryCoefficient: 1.1,
    branch: GameBranch.Retail,
    ranking: {
      class: 11,
      spec: 1,
    },
  },
  FURY_WARRIOR: {
    id: 72,
    index: 7,
    className: defineMessage({
      id: 'specs.warrior',
      message: `Warrior`,
    }),
    specName: defineMessage({
      id: 'specs.fury',
      message: `Fury`,
    }),
    wclClassName: 'Warrior',
    wclSpecName: 'Fury',
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.STRENGTH,
    masterySpellId: 76856,
    masteryCoefficient: 1.4,
    branch: GameBranch.Retail,
    ranking: {
      class: 11,
      spec: 2,
    },
  },
  PROTECTION_WARRIOR: {
    id: 73,
    index: 8,
    className: defineMessage({
      id: 'specs.warrior',
      message: `Warrior`,
    }),
    specName: defineMessage({
      id: 'specs.protection',
      message: `Protection`,
    }),
    wclClassName: 'Warrior',
    wclSpecName: 'Protection',
    role: ROLES.TANK,
    primaryStat: PRIMARY_STAT.STRENGTH,
    masterySpellId: 76857,
    masteryCoefficient: 1.5, //0.5 for increase block chance, 1.5 for chance to critically block and 1 for increased attack power.
    branch: GameBranch.Retail,
    ranking: {
      class: 11,
      spec: 3,
    },
  },
  BALANCE_DRUID: {
    id: 102,
    index: 9,
    className: defineMessage({
      id: 'specs.druid',
      message: `Druid`,
    }),
    specName: defineMessage({
      id: 'specs.balance',
      message: `Balance`,
    }),
    wclClassName: 'Druid',
    wclSpecName: 'Balance',
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 326085,
    masteryCoefficient: 1.1,
    branch: GameBranch.Retail,
    ranking: {
      class: 2,
      spec: 1,
    },
  },
  FERAL_DRUID: {
    id: 103,
    index: 10,
    className: defineMessage({
      id: 'specs.druid',
      message: `Druid`,
    }),
    specName: defineMessage({
      id: 'specs.feral',
      message: `Feral`,
    }),
    wclClassName: 'Druid',
    wclSpecName: 'Feral',
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.AGILITY,
    masterySpellId: 77493,
    masteryCoefficient: 2,
    branch: GameBranch.Retail,
    ranking: {
      class: 2,
      spec: 2,
    },
  },
  GUARDIAN_DRUID: {
    id: 104,
    index: 11,
    className: defineMessage({
      id: 'specs.druid',
      message: `Druid`,
    }),
    specName: defineMessage({
      id: 'specs.guardian',
      message: `Guardian`,
    }),
    wclClassName: 'Druid',
    wclSpecName: 'Guardian',
    role: ROLES.TANK,
    primaryStat: PRIMARY_STAT.AGILITY,
    masterySpellId: 155783,
    masteryCoefficient: 0.5, //1 is the coef for increased attack power
    branch: GameBranch.Retail,
    ranking: {
      class: 2,
      spec: 3,
    },
  },
  RESTORATION_DRUID: {
    id: 105,
    index: 12,
    className: defineMessage({
      id: 'specs.druid',
      message: `Druid`,
    }),
    specName: defineMessage({
      id: 'specs.restoration',
      message: `Restoration`,
    }),
    wclClassName: 'Druid',
    wclSpecName: 'Restoration',
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 77495,
    masteryCoefficient: 0.728,
    branch: GameBranch.Retail,
    ranking: {
      class: 2,
      spec: 4,
    },
  },
  BLOOD_DEATH_KNIGHT: {
    id: 250,
    index: 13,
    className: defineMessage({
      id: 'specs.deathKnight',
      message: `Death Knight`,
    }),
    specName: defineMessage({
      id: 'specs.blood',
      message: `Blood`,
    }),
    wclClassName: 'Death Knight',
    wclSpecName: 'Blood',
    role: ROLES.TANK,
    primaryStat: PRIMARY_STAT.STRENGTH,
    masterySpellId: 77513,
    masteryCoefficient: 2,
    branch: GameBranch.Retail,
    ranking: {
      class: 1,
      spec: 1,
    },
  },
  FROST_DEATH_KNIGHT: {
    id: 251,
    index: 14,
    className: defineMessage({
      id: 'specs.deathKnight',
      message: `Death Knight`,
    }),
    specName: defineMessage({
      id: 'specs.frost',
      message: `Frost`,
    }),
    wclClassName: 'Death Knight',
    wclSpecName: 'Frost',
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.STRENGTH,
    masterySpellId: 77514,
    masteryCoefficient: 2,
    branch: GameBranch.Retail,
    ranking: {
      class: 1,
      spec: 2,
    },
  },
  UNHOLY_DEATH_KNIGHT: {
    id: 252,
    index: 15,
    className: defineMessage({
      id: 'specs.deathKnight',
      message: `Death Knight`,
    }),
    specName: defineMessage({
      id: 'specs.unholy',
      message: `Unholy`,
    }),
    wclClassName: 'Death Knight',
    wclSpecName: 'Unholy',
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.STRENGTH,
    masterySpellId: 77515,
    masteryCoefficient: 1.8,
    branch: GameBranch.Retail,
    ranking: {
      class: 1,
      spec: 3,
    },
  },
  BEAST_MASTERY_HUNTER: {
    id: 253,
    index: 16,
    className: defineMessage({
      id: 'specs.hunter',
      message: `Hunter`,
    }),
    specName: defineMessage({
      id: 'specs.beastMastery',
      message: `Beast Mastery`,
    }),
    wclClassName: 'Hunter',
    wclSpecName: 'Beast Mastery',
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.AGILITY,
    masterySpellId: 76657,
    masteryCoefficient: 1.9,
    branch: GameBranch.Retail,
    ranking: {
      class: 3,
      spec: 1,
    },
  },
  MARKSMANSHIP_HUNTER: {
    id: 254,
    index: 17,
    className: defineMessage({
      id: 'specs.hunter',
      message: `Hunter`,
    }),
    specName: defineMessage({
      id: 'specs.marksmanship',
      message: `Marksmanship`,
    }),
    wclClassName: 'Hunter',
    wclSpecName: 'Marksmanship',
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.AGILITY,
    masterySpellId: 193468,
    masteryCoefficient: 0.625, // this is coeff. for the range part of the mastery, the damage part is different (1.4)
    branch: GameBranch.Retail,
    ranking: {
      class: 3,
      spec: 2,
    },
  },
  SURVIVAL_HUNTER: {
    id: 255,
    index: 18,
    className: defineMessage({
      id: 'specs.hunter',
      message: `Hunter`,
    }),
    specName: defineMessage({
      id: 'specs.survival',
      message: `Survival`,
    }),
    wclClassName: 'Hunter',
    wclSpecName: 'Survival',
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.AGILITY,
    masterySpellId: 191334,
    masteryCoefficient: 1.65, //And a 0.1 coef for % max hp per 5 seconds
    branch: GameBranch.Retail,
    ranking: {
      class: 3,
      spec: 3,
    },
  },
  DISCIPLINE_PRIEST: {
    id: 256,
    index: 19,
    className: defineMessage({
      id: 'specs.priest',
      message: `Priest`,
    }),
    specName: defineMessage({
      id: 'specs.discipline',
      message: `Discipline`,
    }),
    wclClassName: 'Priest',
    wclSpecName: 'Discipline',
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 271534,
    masteryCoefficient: 1.35,
    branch: GameBranch.Retail,
    ranking: {
      class: 7,
      spec: 1,
    },
  },
  HOLY_PRIEST: {
    id: 257,
    index: 20,
    className: defineMessage({
      id: 'specs.priest',
      message: `Priest`,
    }),
    specName: defineMessage({
      id: 'specs.holy',
      message: `Holy`,
    }),
    wclClassName: 'Priest',
    wclSpecName: 'Holy',
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 77485,
    masteryCoefficient: 1.04575,
    branch: GameBranch.Retail,
    ranking: {
      class: 7,
      spec: 2,
    },
  },
  SHADOW_PRIEST: {
    id: 258,
    index: 21,
    className: defineMessage({
      id: 'specs.priest',
      message: `Priest`,
    }),
    specName: defineMessage({
      id: 'specs.shadow',
      message: `Shadow`,
    }),
    wclClassName: 'Priest',
    wclSpecName: 'Shadow',
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 77486,
    masteryCoefficient: 0.5,
    branch: GameBranch.Retail,
    ranking: {
      class: 7,
      spec: 3,
    },
  },
  ASSASSINATION_ROGUE: {
    id: 259,
    index: 22,
    className: defineMessage({
      id: 'specs.rogue',
      message: `Rogue`,
    }),
    specName: defineMessage({
      id: 'specs.assassination',
      message: `Assassination`,
    }),
    wclClassName: 'Rogue',
    wclSpecName: 'Assassination',
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.AGILITY,
    masterySpellId: 76803,
    masteryCoefficient: 1.7,
    branch: GameBranch.Retail,
    ranking: {
      class: 8,
      spec: 1,
    },
  },
  OUTLAW_ROGUE: {
    id: 260,
    index: 23,
    className: defineMessage({
      id: 'specs.rogue',
      message: `Rogue`,
    }),
    specName: defineMessage({
      id: 'specs.outlaw',
      message: `Outlaw`,
    }),
    wclClassName: 'Rogue',
    wclSpecName: 'Outlaw',
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.AGILITY,
    masterySpellId: 76806,
    masteryCoefficient: 1.45,
    branch: GameBranch.Retail,
    ranking: {
      class: 8,
      spec: 4,
    },
  },
  SUBTLETY_ROGUE: {
    id: 261,
    index: 24,
    className: defineMessage({
      id: 'specs.rogue',
      message: `Rogue`,
    }),
    specName: defineMessage({
      id: 'specs.subtlety',
      message: `Subtlety`,
    }),
    wclClassName: 'Rogue',
    wclSpecName: 'Subtlety',
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.AGILITY,
    masterySpellId: 76808,
    masteryCoefficient: 2.45, // the periodic damages are modified by a coeff. of 2.76
    branch: GameBranch.Retail,
    ranking: {
      class: 8,
      spec: 3,
    },
  },
  ELEMENTAL_SHAMAN: {
    id: 262,
    index: 25,
    className: defineMessage({
      id: 'specs.shaman',
      message: `Shaman`,
    }),
    specName: defineMessage({
      id: 'specs.elemental',
      message: `Elemental`,
    }),
    wclClassName: 'Shaman',
    wclSpecName: 'Elemental',
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 168534,
    masteryCoefficient: 1.875, // confirmed
    branch: GameBranch.Retail,
    ranking: {
      class: 9,
      spec: 1,
    },
  },
  ENHANCEMENT_SHAMAN: {
    id: 263,
    index: 26,
    className: defineMessage({
      id: 'specs.shaman',
      message: `Shaman`,
    }),
    specName: defineMessage({
      id: 'specs.enhancement',
      message: `Enhancement`,
    }),
    wclClassName: 'Shaman',
    wclSpecName: 'Enhancement',
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.AGILITY,
    masterySpellId: 77223,
    masteryCoefficient: 2, //proc chance coef. is 0.08
    branch: GameBranch.Retail,
    ranking: {
      class: 9,
      spec: 2,
    },
  },
  RESTORATION_SHAMAN: {
    id: 264,
    index: 27,
    className: defineMessage({
      id: 'specs.shaman',
      message: `Shaman`,
    }),
    specName: defineMessage({
      id: 'specs.restoration',
      message: `Restoration`,
    }),
    wclClassName: 'Shaman',
    wclSpecName: 'Restoration',
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 77226,
    masteryCoefficient: 3, // confirmed
    branch: GameBranch.Retail,
    ranking: {
      class: 9,
      spec: 3,
    },
  },
  AFFLICTION_WARLOCK: {
    id: 265,
    index: 28,
    className: defineMessage({
      id: 'specs.warlock',
      message: `Warlock`,
    }),
    specName: defineMessage({
      id: 'specs.affliction',
      message: `Affliction`,
    }),
    wclClassName: 'Warlock',
    wclSpecName: 'Affliction',
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 77215,
    masteryCoefficient: 2.5,
    branch: GameBranch.Retail,
    ranking: {
      class: 10,
      spec: 1,
    },
  },
  DEMONOLOGY_WARLOCK: {
    id: 266,
    index: 29,
    className: defineMessage({
      id: 'specs.warlock',
      message: `Warlock`,
    }),
    specName: defineMessage({
      id: 'specs.demonology',
      message: `Demonology`,
    }),
    wclClassName: 'Warlock',
    wclSpecName: 'Demonology',
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 77219,
    masteryCoefficient: 1.45,
    branch: GameBranch.Retail,
    ranking: {
      class: 10,
      spec: 2,
    },
  },
  DESTRUCTION_WARLOCK: {
    id: 267,
    index: 30,
    className: defineMessage({
      id: 'specs.warlock',
      message: `Warlock`,
    }),
    specName: defineMessage({
      id: 'specs.destruction',
      message: `Destruction`,
    }),
    wclClassName: 'Warlock',
    wclSpecName: 'Destruction',
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 77220,
    masteryCoefficient: 2, // reduced damage part coef. is 0.666
    branch: GameBranch.Retail,
    ranking: {
      class: 10,
      spec: 3,
    },
  },
  BREWMASTER_MONK: {
    id: 268,
    index: 31,
    className: defineMessage({
      id: 'specs.monk',
      message: `Monk`,
    }),
    specName: defineMessage({
      id: 'specs.brewmaster',
      message: `Brewmaster`,
    }),
    wclClassName: 'Monk',
    wclSpecName: 'Brewmaster',
    role: ROLES.TANK,
    primaryStat: PRIMARY_STAT.AGILITY,
    masterySpellId: 117906,
    masteryCoefficient: 1,
    branch: GameBranch.Retail,
    ranking: {
      class: 5,
      spec: 1,
    },
  },
  WINDWALKER_MONK: {
    id: 269,
    index: 32,
    className: defineMessage({
      id: 'specs.monk',
      message: `Monk`,
    }),
    specName: defineMessage({
      id: 'specs.windwalker',
      message: `Windwalker`,
    }),
    wclClassName: 'Monk',
    wclSpecName: 'Windwalker',
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.AGILITY,
    masterySpellId: 115636,
    masteryCoefficient: 1.25,
    branch: GameBranch.Retail,
    ranking: {
      class: 5,
      spec: 3,
    },
  },
  MISTWEAVER_MONK: {
    id: 270,
    index: 33,
    className: defineMessage({
      id: 'specs.monk',
      message: `Monk`,
    }),
    specName: defineMessage({
      id: 'specs.mistweaver',
      message: `Mistweaver`,
    }),
    wclClassName: 'Monk',
    wclSpecName: 'Mistweaver',
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 117907,
    masteryCoefficient: 4.2,
    branch: GameBranch.Retail,
    ranking: {
      class: 5,
      spec: 2,
    },
  },
  HAVOC_DEMON_HUNTER: {
    id: 577,
    index: 34,
    className: defineMessage({
      id: 'specs.demonHunter',
      message: `Demon Hunter`,
    }),
    specName: defineMessage({
      id: 'specs.havoc',
      message: `Havoc`,
    }),
    wclClassName: 'Demon Hunter',
    wclSpecName: 'Havoc',
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.AGILITY,
    masterySpellId: 185164,
    masteryCoefficient: 1.8, //0.6 coefficient for movement speed
    branch: GameBranch.Retail,
    ranking: {
      class: 12,
      spec: 1,
    },
  },
  VENGEANCE_DEMON_HUNTER: {
    id: 581,
    index: 35,
    className: defineMessage({
      id: 'specs.demonHunter',
      message: `Demon Hunter`,
    }),
    specName: defineMessage({
      id: 'specs.vengeance',
      message: `Vengeance`,
    }),
    wclClassName: 'Demon Hunter',
    wclSpecName: 'Vengeance',
    role: ROLES.TANK,
    primaryStat: PRIMARY_STAT.AGILITY,
    masterySpellId: 203747,
    masteryCoefficient: 3, //1 for increased atk power
    branch: GameBranch.Retail,
    ranking: {
      class: 12,
      spec: 2,
    },
  },
  DEVASTATION_EVOKER: {
    id: 1467,
    index: 36,
    className: defineMessage({
      id: 'specs.evoker',
      message: `Evoker`,
    }),
    specName: defineMessage({
      id: 'specs.devastation',
      message: 'Devastation',
    }),
    wclClassName: 'Evoker',
    wclSpecName: 'Devastation',
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 362980,
    masteryCoefficient: 2.5,
    branch: GameBranch.Retail,
    ranking: {
      class: 13,
      spec: 1,
    },
  },
  PRESERVATION_EVOKER: {
    id: 1468,
    index: 37,
    className: defineMessage({
      id: 'specs.evoker',
      message: `Evoker`,
    }),
    specName: defineMessage({
      id: 'specs.preservation',
      message: 'Preservation',
    }),
    wclClassName: 'Evoker',
    wclSpecName: 'Preservation',
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 363510,
    masteryCoefficient: 1.8,
    branch: GameBranch.Retail,
    ranking: {
      class: 13,
      spec: 2,
    },
  },
  AUGMENTATION_EVOKER: {
    id: 1473,
    index: 38,
    className: defineMessage({
      id: 'specs.evoker',
      message: `Evoker`,
    }),
    specName: defineMessage({
      id: 'specs.augmentation',
      message: 'Augmentation',
    }),
    wclClassName: 'Evoker',
    wclSpecName: 'Augmentation',
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    masterySpellId: 406380,
    masteryCoefficient: TIMEWALKER_MASTERY_COEFFICIENT, //0.34 for Vers buff
    branch: GameBranch.Retail,
    ranking: {
      class: 13,
      spec: 3,
    },
  },

  // --------------
  // CLASSIC SPECS
  // --------------
  CLASSIC_WARRIOR_ARMS: {
    id: 161,
    index: 100,
    type: 'Warrior',
    className: defineMessage({
      id: 'specs.warrior',
      message: `Warrior`,
    }),
    specName: defineMessage({
      id: 'specs.arms',
      message: `Arms`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.STRENGTH,
    branch: GameBranch.Classic,
    ranking: {
      class: 11,
      spec: 1,
    },
    icon: 'Warrior-Arms',
    wclClassName: 'Warrior',
    wclSpecName: 'Arms',
    treeIndex: 0,
  },
  CLASSIC_WARRIOR_FURY: {
    id: 164,
    index: 101,
    type: 'Warrior',
    className: defineMessage({
      id: 'specs.warrior',
      message: `Warrior`,
    }),
    specName: defineMessage({
      id: 'specs.fury',
      message: `Fury`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.STRENGTH,
    branch: GameBranch.Classic,
    ranking: {
      class: 11,
      spec: 2,
    },
    icon: 'Warrior-Fury',
    wclClassName: 'Warrior',
    wclSpecName: 'Fury',
    treeIndex: 1,
  },
  CLASSIC_WARRIOR_PROTECTION: {
    id: 163,
    index: 102,
    type: 'Warrior',
    className: defineMessage({
      id: 'specs.warrior',
      message: `Warrior`,
    }),
    specName: defineMessage({
      id: 'specs.protection',
      message: `Protection`,
    }),
    role: ROLES.TANK,
    primaryStat: PRIMARY_STAT.STRENGTH,
    branch: GameBranch.Classic,
    ranking: {
      class: 11,
      spec: 3,
    },
    icon: 'Warrior-Protection',
    wclClassName: 'Warrior',
    wclSpecName: 'Protection',
    treeIndex: 2,
  },
  CLASSIC_PALADIN_HOLY: {
    id: 382,
    type: 'Paladin',
    index: 103,
    className: defineMessage({
      id: 'className.paladin',
      message: `Paladin`,
    }),
    specName: defineMessage({
      id: 'specs.holy',
      message: `Holy`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STAT.INTELLECT,
    branch: GameBranch.Classic,
    ranking: {
      class: 6,
      spec: 1,
    },
    icon: 'Paladin-Holy',
    wclClassName: 'Paladin',
    wclSpecName: 'Holy',
    treeIndex: 0,
  },
  CLASSIC_PALADIN_PROTECTION: {
    id: 383,
    type: 'Paladin',
    index: 104,
    className: defineMessage({
      id: 'className.paladin',
      message: `Paladin`,
    }),
    specName: defineMessage({
      id: 'specs.protection',
      message: `Protection`,
    }),
    role: ROLES.TANK,
    primaryStat: PRIMARY_STAT.STRENGTH,
    branch: GameBranch.Classic,
    ranking: {
      class: 6,
      spec: 2,
    },
    icon: 'Paladin-Protection',
    wclClassName: 'Paladin',
    wclSpecName: 'Protection',
    treeIndex: 1,
  },
  CLASSIC_PALADIN_RETRIBUTION: {
    id: 381,
    type: 'Paladin',
    index: 105,
    className: defineMessage({
      id: 'className.paladin',
      message: `Paladin`,
    }),
    specName: defineMessage({
      id: 'specs.retribution',
      message: `Retribution`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.STRENGTH,
    branch: GameBranch.Classic,
    ranking: {
      class: 6,
      spec: 3,
    },
    icon: 'Paladin-Retribution',
    wclClassName: 'Paladin',
    wclSpecName: 'Retribution',
    treeIndex: 2,
  },
  CLASSIC_HUNTER_BEAST_MASTERY: {
    id: 361,
    type: 'Hunter',
    index: 106,
    className: defineMessage({
      id: 'className.hunter',
      message: `Hunter`,
    }),
    specName: defineMessage({
      id: 'specs.beastMastery',
      message: `Beast Mastery`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.AGILITY,
    branch: GameBranch.Classic,
    ranking: {
      class: 3,
      spec: 1,
    },
    icon: 'Hunter-BeastMastery',
    wclClassName: 'Hunter',
    wclSpecName: 'BeastMastery',
    treeIndex: 0,
  },
  CLASSIC_HUNTER_MARKSMANSHIP: {
    id: 363,
    type: 'Hunter',
    index: 107,
    className: defineMessage({
      id: 'className.hunter',
      message: `Hunter`,
    }),
    specName: defineMessage({
      id: 'specs.marksmanship',
      message: `Marksmanship`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.AGILITY,
    branch: GameBranch.Classic,
    ranking: {
      class: 3,
      spec: 2,
    },
    icon: 'Hunter-Marksmanship',
    wclClassName: 'Hunter',
    wclSpecName: 'Marksmanship',
    treeIndex: 1,
  },
  CLASSIC_HUNTER_SURVIVAL: {
    id: 362,
    type: 'Hunter',
    index: 108,
    className: defineMessage({
      id: 'className.hunter',
      message: `Hunter`,
    }),
    specName: defineMessage({
      id: 'specs.survival',
      message: `Survival`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.AGILITY,
    branch: GameBranch.Classic,
    ranking: {
      class: 3,
      spec: 3,
    },
    icon: 'Hunter-Survival',
    wclClassName: 'Hunter',
    wclSpecName: 'Survival',
    treeIndex: 2,
  },
  CLASSIC_ROGUE_ASSASSINATION: {
    id: 182,
    type: 'Rogue',
    index: 109,
    className: defineMessage({
      id: 'className.rogue',
      message: `Rogue`,
    }),
    specName: defineMessage({
      id: 'specs.assassination',
      message: `Assassination`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.AGILITY,
    branch: GameBranch.Classic,
    ranking: {
      class: 8,
      spec: 1,
    },
    icon: 'Rogue-Assassination',
    wclClassName: 'Rogue',
    wclSpecName: 'Assassination',
    treeIndex: 0,
  },
  CLASSIC_ROGUE_COMBAT: {
    id: 181,
    type: 'Rogue',
    index: 110,
    className: defineMessage({
      id: 'className.rogue',
      message: `Rogue`,
    }),
    specName: defineMessage({
      id: 'specs.combat',
      message: `Combat`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.AGILITY,
    branch: GameBranch.Classic,
    ranking: {
      class: 8,
      spec: 2,
    },
    icon: 'Rogue-Combat',
    wclClassName: 'Rogue',
    wclSpecName: 'Combat',
    treeIndex: 1,
  },
  CLASSIC_ROGUE_SUBTLETY: {
    id: 183,
    type: 'Rogue',
    index: 111,
    className: defineMessage({
      id: 'className.rogue',
      message: `Rogue`,
    }),
    specName: defineMessage({
      id: 'specs.subtlety',
      message: `Subtlety`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.AGILITY,
    branch: GameBranch.Classic,
    ranking: {
      class: 8,
      spec: 3,
    },
    icon: 'Rogue-Subtlety',
    wclClassName: 'Rogue',
    wclSpecName: 'Subtlety',
    treeIndex: 2,
  },
  CLASSIC_PRIEST_DISCIPLINE: {
    id: 201,
    type: 'Priest',
    index: 112,
    className: defineMessage({
      id: 'className.priest',
      message: `Priest`,
    }),
    specName: defineMessage({
      id: 'specs.discipline',
      message: `Discipline`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STAT.INTELLECT,
    branch: GameBranch.Classic,
    ranking: {
      class: 7,
      spec: 1,
    },
    icon: 'Priest-Discipline',
    wclClassName: 'Priest',
    wclSpecName: 'Discipline',
    treeIndex: 0,
  },
  CLASSIC_PRIEST_HOLY: {
    id: 202,
    type: 'Priest',
    index: 113,
    className: defineMessage({
      id: 'className.priest',
      message: `Priest`,
    }),
    specName: defineMessage({
      id: 'specs.holy',
      message: `Holy`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STAT.INTELLECT,
    branch: GameBranch.Classic,
    ranking: {
      class: 7,
      spec: 2,
    },
    icon: 'Priest-Holy',
    wclClassName: 'Priest',
    wclSpecName: 'Holy',
    treeIndex: 1,
  },
  CLASSIC_PRIEST_SHADOW: {
    id: 203,
    type: 'Priest',
    index: 114,
    className: defineMessage({
      id: 'className.priest',
      message: `Priest`,
    }),
    specName: defineMessage({
      id: 'specs.shadow',
      message: `Shadow`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    branch: GameBranch.Classic,
    ranking: {
      class: 7,
      spec: 3,
    },
    icon: 'Priest-Shadow',
    wclClassName: 'Priest',
    wclSpecName: 'Shadow',
    treeIndex: 2,
  },
  CLASSIC_DEATH_KNIGHT_BLOOD: {
    id: 398,
    type: 'DeathKnight',
    index: 115,
    className: defineMessage({
      id: 'specs.deathKnight',
      message: `Death Knight`,
    }),
    specName: defineMessage({
      id: 'specs.blood',
      message: `Blood`,
    }),
    role: ROLES.TANK,
    primaryStat: PRIMARY_STAT.STRENGTH,
    branch: GameBranch.Classic,
    ranking: {
      class: 1,
      spec: 1,
    },
    icon: 'DeathKnight-Blood',
    wclClassName: 'DeathKnight',
    wclSpecName: 'Blood',
    treeIndex: 0,
  },
  CLASSIC_DEATH_KNIGHT_FROST: {
    id: 399,
    type: 'DeathKnight',
    index: 116,
    className: defineMessage({
      id: 'specs.deathKnight',
      message: `Death Knight`,
    }),
    specName: defineMessage({
      id: 'specs.frost',
      message: `Frost`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.STRENGTH,
    branch: GameBranch.Classic,
    ranking: {
      class: 1,
      spec: 2,
    },
    icon: 'DeathKnight-Frost',
    wclClassName: 'DeathKnight',
    wclSpecName: 'Frost',
    treeIndex: 1,
  },
  CLASSIC_DEATH_KNIGHT_UNHOLY: {
    id: 400,
    type: 'DeathKnight',
    index: 117,
    className: defineMessage({
      id: 'specs.deathKnight',
      message: `Death Knight`,
    }),
    specName: defineMessage({
      id: 'specs.unholy',
      message: `Unholy`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.STRENGTH,
    branch: GameBranch.Classic,
    ranking: {
      class: 1,
      spec: 3,
    },
    icon: 'DeathKnight-Unholy',
    wclClassName: 'DeathKnight',
    wclSpecName: 'Unholy',
    treeIndex: 2,
  },
  CLASSIC_SHAMAN_ELEMENTAL: {
    // wowhead id is 261 but that's the same id as retail Subtlety Rogue
    id: 2610,
    type: 'Shaman',
    index: 118,
    className: defineMessage({
      id: 'className.shaman',
      message: `Shaman`,
    }),
    specName: defineMessage({
      id: 'specs.elemental',
      message: `Elemental`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    branch: GameBranch.Classic,
    ranking: {
      class: 9,
      spec: 1,
    },
    icon: 'Shaman-Elemental',
    wclClassName: 'Shaman',
    wclSpecName: 'Elemental',
    treeIndex: 0,
  },
  CLASSIC_SHAMAN_ENHANCEMENT: {
    // wowhead id is 263 but that's the same id as retail Enhancement Shaman
    id: 2630,
    type: 'Shaman',
    index: 119,
    className: defineMessage({
      id: 'className.shaman',
      message: `Shaman`,
    }),
    specName: defineMessage({
      id: 'specs.enhancement',
      message: `Enhancement`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.STRENGTH,
    branch: GameBranch.Classic,
    ranking: {
      class: 9,
      spec: 2,
    },
    icon: 'Shaman-Enhancement',
    wclClassName: 'Shaman',
    wclSpecName: 'Enhancement',
    treeIndex: 1,
  },
  CLASSIC_SHAMAN_RESTORATION: {
    // wowhead id is 262 but that's the same id as retail Restoration Shaman
    id: 2620,
    type: 'Shaman',
    index: 120,
    className: defineMessage({
      id: 'className.shaman',
      message: `Shaman`,
    }),
    specName: defineMessage({
      id: 'specs.restoration',
      message: `Restoration`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STAT.INTELLECT,
    branch: GameBranch.Classic,
    ranking: {
      class: 9,
      spec: 3,
    },
    icon: 'Shaman-Restoration',
    wclClassName: 'Shaman',
    wclSpecName: 'Restoration',
    treeIndex: 2,
  },
  CLASSIC_MAGE_ARCANE: {
    id: 81,
    index: 121,
    type: 'Mage',
    className: defineMessage({
      id: 'specs.mage',
      message: `Mage`,
    }),
    specName: defineMessage({
      id: 'specs.mage.arcane',
      message: `Arcane`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    branch: GameBranch.Classic,
    ranking: {
      class: 4,
      spec: 1,
    },
    icon: 'Mage-Arcane',
    wclClassName: 'Mage',
    wclSpecName: 'Arcane',
    treeIndex: 0,
  },
  CLASSIC_MAGE_FIRE: {
    id: 41,
    index: 122,
    type: 'Mage',
    className: defineMessage({
      id: 'specs.mage',
      message: `Mage`,
    }),
    specName: defineMessage({
      id: 'specs.fire',
      message: `Fire`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    branch: GameBranch.Classic,
    ranking: {
      class: 4,
      spec: 2,
    },
    icon: 'Mage-Fire',
    wclClassName: 'Mage',
    wclSpecName: 'Fire',
    treeIndex: 1,
  },
  CLASSIC_MAGE_FROST: {
    id: 61,
    index: 123,
    type: 'Mage',
    className: defineMessage({
      id: 'specs.mage',
      message: `Mage`,
    }),
    specName: defineMessage({
      id: 'specs.frost',
      message: `Frost`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    branch: GameBranch.Classic,
    ranking: {
      class: 4,
      spec: 3,
    },
    icon: 'Mage-Frost',
    wclClassName: 'Mage',
    wclSpecName: 'Frost',
    treeIndex: 2,
  },
  CLASSIC_WARLOCK_AFFLICTION: {
    id: 302,
    type: 'Warlock',
    index: 124,
    className: defineMessage({
      id: 'className.warlock',
      message: `Warlock`,
    }),
    specName: defineMessage({
      id: 'specs.affliction',
      message: `Affliction`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    branch: GameBranch.Classic,
    ranking: {
      class: 10,
      spec: 1,
    },
    icon: 'Warlock-Affliction',
    wclClassName: 'Warlock',
    wclSpecName: 'Affliction',
    treeIndex: 0,
  },
  CLASSIC_WARLOCK_DEMONOLOGY: {
    id: 303,
    type: 'Warlock',
    index: 125,
    className: defineMessage({
      id: 'className.warlock',
      message: `Warlock`,
    }),
    specName: defineMessage({
      id: 'specs.demonology',
      message: `Demonology`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    branch: GameBranch.Classic,
    ranking: {
      class: 10,
      spec: 2,
    },
    icon: 'Warlock-Demonology',
    wclClassName: 'Warlock',
    wclSpecName: 'Demonology',
    treeIndex: 1,
  },
  CLASSIC_WARLOCK_DESTRUCTION: {
    id: 301,
    type: 'Warlock',
    index: 126,
    className: defineMessage({
      id: 'className.warlock',
      message: `Warlock`,
    }),
    specName: defineMessage({
      id: 'specs.destruction',
      message: `Destruction`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    branch: GameBranch.Classic,
    ranking: {
      class: 10,
      spec: 3,
    },
    icon: 'Warlock-Destruction',
    wclClassName: 'Warlock',
    wclSpecName: 'Destruction',
    treeIndex: 2,
  },
  CLASSIC_DRUID_BALANCE: {
    id: 283,
    type: 'Druid',
    index: 127,
    className: defineMessage({
      id: 'className.druid',
      message: `Druid`,
    }),
    specName: defineMessage({
      id: 'specs.balance',
      message: `Balance`,
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STAT.INTELLECT,
    branch: GameBranch.Classic,
    ranking: {
      class: 2,
      spec: 1,
    },
    icon: 'Druid-Balance',
    wclClassName: 'Druid',
    wclSpecName: 'Balance',
    treeIndex: 0,
  },
  CLASSIC_DRUID_FERAL_COMBAT: {
    id: 281,
    type: 'Druid',
    index: 128,
    className: defineMessage({
      id: 'className.druid',
      message: `Druid`,
    }),
    specName: defineMessage({
      id: 'specs.feral',
      message: `Feral`,
    }),
    role: ROLES.DPS.MELEE,
    primaryStat: PRIMARY_STAT.STRENGTH,
    branch: GameBranch.Classic,
    ranking: {
      class: 2,
      spec: 2,
    },
    icon: 'Druid-Feral',
    wclClassName: 'Druid',
    wclSpecName: 'Feral',
    treeIndex: 1,
  },
  CLASSIC_DRUID_RESTORATION: {
    id: 282,
    type: 'Druid',
    index: 129,
    className: defineMessage({
      id: 'className.druid',
      message: `Druid`,
    }),
    specName: defineMessage({
      id: 'specs.restoration',
      message: `Restoration`,
    }),
    role: ROLES.HEALER,
    primaryStat: PRIMARY_STAT.INTELLECT,
    branch: GameBranch.Classic,
    ranking: {
      class: 2,
      spec: 4,
    },
    icon: 'Druid-Restoration',
    wclClassName: 'Druid',
    wclSpecName: 'Restoration',
    treeIndex: 2,
  },
  CLASSIC_DRUID_GUARDIAN: {
    id: 284,
    type: 'Druid',
    index: 130,
    className: defineMessage({
      id: 'className.druid',
      message: `Druid`,
    }),
    specName: defineMessage({
      id: 'specs.guardian',
      message: `Guardian`,
    }),
    role: ROLES.TANK,
    primaryStat: PRIMARY_STAT.STRENGTH,
    branch: GameBranch.Classic,
    ranking: {
      class: 2,
      spec: 3,
    },
    icon: 'Druid-Guardian',
    wclClassName: 'Druid',
    wclSpecName: 'Guardian',
  },
} satisfies Record<string, Spec>;

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
export const EVOKER_SPECS: Spec[] = [
  SPECS.DEVASTATION_EVOKER,
  SPECS.PRESERVATION_EVOKER,
  SPECS.AUGMENTATION_EVOKER,
];
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
