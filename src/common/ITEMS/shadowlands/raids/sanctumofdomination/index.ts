/**
 * NAME: {
 *   id: number,
 *   name: string,
 *   icon: string,
 *   quality: number,
 * },
 */
const items = {
  //region The Tarragrue
  TOME_OF_MONSTROUS_CONSTRUCTIONS: {
    id: 186422,
    name: 'Tome of Monstrous Constructions',
    icon: 'inv_artifact_tome02',
  },
  //endregion

  //region The Eye of the Jailer
  TITANIC_OCULAR_GLAND: {
    id: 186423,
    name: 'Titanic Ocular Gland',
    icon: 'spell_holy_healingfocus',
  },
  //endregion

  //region The Nine
  SCRAWLED_WORD_OF_RECALL: {
    id: 186425,
    name: 'Scrawled Word of Recall',
    icon: 'inv_inscription_80_scroll',
  },
  SHARD_OF_ANNHYLDES_AEGIS: {
    id: 186424,
    name: "Shard of Annhylde's Aegis",
    icon: 'inv_shield_1h_bastionquest_b_01',
  },
  //endregion

  //region Remnant of Ner'zhul
  SHADOWED_ORB_OF_TORMENT: {
    id: 186428,
    name: 'Shadowed Orb of Torment',
    icon: 'spell_animamaw_orb',
  },
  WHISPERING_SHARD_OF_POWER: {
    id: 186427,
    name: 'Whispering Shard of Power',
    icon: 'inv_belt_cloth_shadowmoonclan_b_01',
  },
  //endregion

  //region Soulrender Dormazain
  DECANTER_OF_ENDLESS_HOWLING: {
    id: 186429,
    name: 'Decanter of Endless Howling',
    icon: 'ability_soulrenderdormazain_hellscream',
  },
  //endregion

  //region Painsmith Raznal
  EBONSOUL_VISE: {
    id: 186431,
    name: 'Ebonsoul Vise',
    icon: 'ability_warlock_improvedsoulleech',
  },
  TORMENTED_RACK_FRAGMENT: {
    id: 186430,
    name: 'Tormented Rack Fragment',
    icon: 'ability_warlock_soulswap',
  },
  //endregion

  //region Guardian of the First Ones
  REACTIVE_DEFENSIVE_MATRIX: {
    id: 186433,
    name: 'Reactive Defensive Matrix',
    icon: 'spell_progenitor_orb2',
  },
  SALVAGED_FUSION_AMPLIFIER: {
    id: 186432,
    name: 'Salvaged Fusion Amplifier',
    icon: 'spell_progenitor_missile',
  },
  //endregion

  //region Fatescribe Roh-Kalo
  CARVED_IVORY_KEEPSAKE: {
    id: 186435,
    name: 'Carved Ivory Keepsake',
    icon: 'spell_arcane_teleportoribos',
  },
  WEAVE_OF_WARPED_FATES: {
    id: 186434,
    name: 'Weave of Warped Fates',
    icon: 'inv_tailoring_815_synchronousthread',
  },
  //endregion

  //region Kel'Thuzad
  FORBIDDEN_NECROMANTIC_TOME: {
    id: 186421,
    name: 'Forbidden Necromantic Tome',
    icon: 'inv_misc_book_18',
  },
  RELIC_OF_THE_FROZEN_WASTES: {
    id: 186437,
    name: 'Relic of the Frozen Wastes',
    icon: 'trade_archaeology_nerubianspiderscepter',
  },
  RESONANT_SILVER_BELL: {
    id: 186436,
    name: 'Resonant Silver Bell',
    icon: 'inv_inscription_inksilver03',
  },
  //endregion

  //region Sylvanas Windrunner
  OLD_WARRIORS_SOUL: {
    id: 186438,
    name: 'Undying Rage',
    icon: 'ability_warrior_warcry',
  },
  //endregion
} as const;
export default items;
