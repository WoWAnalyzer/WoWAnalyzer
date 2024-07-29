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
export type ResourceCostPerSecondType = Uncapitalize<`${keyof typeof ResourceTypes}CostPerSecond`>;

export type GenericTalentDefinitionId = {
  id: number;
  specId: number;
};

export type GenericTalentInterface = {
  [key in ResourceCostType]?: number;
} & {
  [key in ResourceCostPerSecondType]?: number;
} & {
  id: number;
  name: string;
  icon: string;
  maxRanks: number;
  entryIds: number[];
  definitionIds: GenericTalentDefinitionId[];
  sourceTree?: 'class' | 'spec' | 'hero';
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
  heroNodes: TalentNode[];
}

export interface TalentNode {
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

export interface TalentEntry {
  id: number;
  definitionId: number;
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

export enum ClassNodeType {
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
