export enum DBCTable {
  ItemXItemEffect = 'ItemXItemEffect',
  ItemEffect = 'ItemEffect',
  SpellEffect = 'SpellEffect',
  RandPropPoints = 'RandPropPoints',
  SpellPower = 'SpellPower',
}

// https://wago.tools/api/builds/latest
export interface DBCBuilds {
  wow: DBCBuild;
  wow_anniversary: DBCBuild;
  wow_beta: DBCBuild;
  wow_classic: DBCBuild;
  wow_classic_beta: DBCBuild;
  wow_classic_era: DBCBuild;
  wow_classic_era_ptr: DBCBuild;
  wow_classic_ptr: DBCBuild;
  wow_classic_titan: DBCBuild;
  wowlivetest: DBCBuild;
  wowt: DBCBuild;
  wowxptr: DBCBuild;
  wowz: DBCBuild;
}

export interface DBCBuild {
  product: string;
  version: string;
  created_at: string;
  build_config: string;
  product_config: string;
  cdn_config: string;
}

// https://wago.tools/db2/ItemXItemEffect
export interface ItemXItemEffectEntry {
  ItemID: number;
  ItemEffectID: number;
}

// https://wago.tools/db2/ItemEffect
export interface ItemEffectEntry {
  ID: number;
  SpellID: number;
}

// https://wago.tools/db2/SpellEffect
export interface SpellEffectEntry {
  SpellID: number;
  EffectMiscValue_0: number;
  Effect: number;
}
