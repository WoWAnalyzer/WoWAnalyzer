export enum ResourceTypes {
  Mana,
  Rage,
  Focus,
  Energy,
  ComboPoints,
  Runes,
  RunicPower,
  SoulShards,
  LunarPower,
  HolyPower,
  AlternatePower,
  Maelstrom,
  Chi,
  Insanity,
  Unused14PowerType,
  Unused15Powertype,
  ArcaneCharges,
  Fury,
  Pain,
  Essence,
}

export type ResourceCostType = Uncapitalize<`${keyof typeof ResourceTypes}Cost`>;

export type GenericTalentInterface = {
  [key in ResourceCostType]?: number;
} & {
  id: number;
  name: string;
  icon: string;
  maxRanks: number;
  spec?: string;
  reqPoints?: number;
  talentType?: ClassNodeType;
  spellType?: EntryType;
};

export interface ITalentObjectByClass {
  [className: string]: {
    Shared: Record<string, GenericTalentInterface>;
    [specName: string]: Record<string, GenericTalentInterface>;
  };
}

export interface ITalentTree {
  className: string;
  classId: number;
  specName: string;
  specId: number;
  classNodes: TalentNode[];
  specNodes: TalentNode[];
}

interface TalentNode {
  id: number;
  name: string;
  type: ClassNodeType;
  posX: number;
  posY: number;
  maxRanks: number;
  entryNode?: boolean;
  next: number[];
  entries: TalentEntry[];
  freeNode?: boolean;
  reqPoints?: number;
}

interface TalentEntry {
  id: number;
  maxRanks: number;
  type: EntryType;
  name?: string;
  spellId?: number;
  icon: string;
}

enum EntryType {
  Active = 'active',
  Passive = 'passive',
}

enum ClassNodeType {
  Choice = 'choice',
  Single = 'single',
  Tiered = 'tiered',
}

export interface ISpellpower {
  ID: string;
  OrderIndex: string;
  ManaCost: string;
  ManaCostPerLevel: string;
  ManaPerSecond: string;
  PowerDisplayID: string;
  AltPowerBarID: string;
  PowerCostPct: string;
  PowerCostMaxPct: string;
  PowerPctPerSecond: string;
  PowerType: string;
  RequiredAuraSpellID: string;
  OptionalCost: string;
  SpellID: string;
}
