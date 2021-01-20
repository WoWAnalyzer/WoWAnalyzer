import indexById from 'common/indexById';
import { t } from '@lingui/macro';

import ROLES from './ROLES';
import PRIMARY_STATS from './PRIMARY_STATS';

export interface Spec {
  id: number;
  index: number;
  className: string;
  specName: string;
  role: number;
  primaryStat: string;
  masterySpellId: number;
  masteryCoefficient: number;
  ranking: {
    class: number;
    spec: number;
  };
}

const SPECS: {
  [key: string]: Spec;
  [id: number]: Spec;
} = {
  ARCANE_MAGE: {
    id: 62,
    index: 0,
    className: t({
      id: "specs.mage",
      message: `Mage`
    }),
    specName: t({
      id: "specs.mage.arcane",
      message: `Arcane`
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
      id: "specs.mage",
      message: `Mage`
    }),
    specName: t({
      id: "specs.fire",
      message: `Fire`
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
      id: "specs.mage",
      message: `Mage`
    }),
    specName: t({
      id: "specs.frost",
      message: `Frost`
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
      id: "specs.paladin",
      message: `Paladin`
    }),
    specName: t({
      id: "specs.holy",
      message: `Holy`
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
      id: "specs.paladin",
      message: `Paladin`
    }),
    specName: t({
      id: "specs.protection",
      message: `Protection`
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
      id: "specs.paladin",
      message: `Paladin`
    }),
    specName: t({
      id: "specs.retribution",
      message: `Retribution`
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
      id: "specs.warrior",
      message: `Warrior`
    }),
    specName: t({
      id: "specs.arms",
      message: `Arms`
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
      id: "specs.warrior",
      message: `Warrior`
    }),
    specName: t({
      id: "specs.fury",
      message: `Fury`
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
      id: "specs.warrior",
      message: `Warrior`
    }),
    specName: t({
      id: "specs.protection",
      message: `Protection`
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
      id: "specs.druid",
      message: `Druid`
    }),
    specName: t({
      id: "specs.balance",
      message: `Balance`
    }),
    role: ROLES.DPS.RANGED,
    primaryStat: PRIMARY_STATS.INTELLECT,
    masterySpellId: 77492,
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
      id: "specs.druid",
      message: `Druid`
    }),
    specName: t({
      id: "specs.feral",
      message: `Feral`
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
      id: "specs.druid",
      message: `Druid`
    }),
    specName: t({
      id: "specs.guardian",
      message: `Guardian`
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
      id: "specs.druid",
      message: `Druid`
    }),
    specName: t({
      id: "specs.restoration",
      message: `Restoration`
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
      id: "specs.deathKnight",
      message: `Death Knight`
    }),
    specName: t({
      id: "specs.blood",
      message: `Blood`
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
      id: "specs.deathKnight",
      message: `Death Knight`
    }),
    specName: t({
      id: "specs.frost",
      message: `Frost`
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
      id: "specs.deathKnight",
      message: `Death Knight`
    }),
    specName: t({
      id: "specs.unholy",
      message: `Unholy`
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
      id: "specs.hunter",
      message: `Hunter`
    }),
    specName: t({
      id: "specs.beastMastery",
      message: `Beast Mastery`
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
      id: "specs.hunter",
      message: `Hunter`
    }),
    specName: t({
      id: "specs.marksmanship",
      message: `Marksmanship`
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
      id: "specs.hunter",
      message: `Hunter`
    }),
    specName: t({
      id: "specs.survival",
      message: `Survival`
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
      id: "specs.priest",
      message: `Priest`
    }),
    specName: t({
      id: "specs.discipline",
      message: `Discipline`
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
      id: "specs.priest",
      message: `Priest`
    }),
    specName: t({
      id: "specs.holy",
      message: `Holy`
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
      id: "specs.priest",
      message: `Priest`
    }),
    specName: t({
      id: "specs.shadow",
      message: `Shadow`
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
      id: "specs.rogue",
      message: `Rogue`
    }),
    specName: t({
      id: "specs.assassination",
      message: `Assassination`
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
      id: "specs.rogue",
      message: `Rogue`
    }),
    specName: t({
      id: "specs.outlaw",
      message: `Outlaw`
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
      id: "specs.rogue",
      message: `Rogue`
    }),
    specName: t({
      id: "specs.subtlety",
      message: `Subtlety`
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
      id: "specs.shaman",
      message: `Shaman`
    }),
    specName: t({
      id: "specs.elemental",
      message: `Elemental`
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
      id: "specs.shaman",
      message: `Shaman`
    }),
    specName: t({
      id: "specs.enhancement",
      message: `Enhancement`
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
      id: "specs.shaman",
      message: `Shaman`
    }),
    specName: t({
      id: "specs.restoration",
      message: `Restoration`
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
      id: "specs.warlock",
      message: `Warlock`
    }),
    specName: t({
      id: "specs.affliction",
      message: `Affliction`
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
      id: "specs.warlock",
      message: `Warlock`
    }),
    specName: t({
      id: "specs.demonology",
      message: `Demonology`
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
      id: "specs.warlock",
      message: `Warlock`
    }),
    specName: t({
      id: "specs.destruction",
      message: `Destruction`
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
      id: "specs.monk",
      message: `Monk`
    }),
    specName: t({
      id: "specs.brewmaster",
      message: `Brewmaster`
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
      id: "specs.monk",
      message: `Monk`
    }),
    specName: t({
      id: "specs.windwalker",
      message: `Windwalker`
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
      id: "specs.monk",
      message: `Monk`
    }),
    specName: t({
      id: "specs.mistweaver",
      message: `Mistweaver`
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
      id: "specs.demonHunter",
      message: `Demon Hunter`
    }),
    specName: t({
      id: "specs.havoc",
      message: `Havoc`
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
      id: "specs.demonHunter",
      message: `Demon Hunter`
    }),
    specName: t({
      id: "specs.vengeance",
      message: `Vengeance`
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
};

export default indexById(SPECS);
