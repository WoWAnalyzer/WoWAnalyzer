import { spellIndexableList } from '../../../Spell';

const items = spellIndexableList({
  // Group by boss (with comments)

  //region The Tarragrue
  TOME_OF_MONSTROUS_CONSTRUCTIONS: {
    id: 353692,
    name: 'Studying',
    icon: 'inv_artifact_tome02',
  },
  //endregion

  //region Eye of the Jailer
  TITANIC_OCULAR_GLAND: {
    id: 355313,
    name: 'Titanic Ocular Gland',
    icon: 'spell_holy_healingfocus',
  },
  //endregion

  //region The Nine
  SCRAWLED_WORD_OF_RECALL: {
    id: 355318,
    name: 'Word of Recall',
    icon: 'inv_inscription_80_scroll',
  },
  SHARD_OF_ANNHYLDES_AEGIS: {
    id: 358712,
    name: "Annhylde's Aegis",
    icon: 'inv_shield_1h_bastionquest_b_01',
  },
  //endregion

  //region Remnant of Ner'zhul
  SHADOWED_ORB_OF_TORMENT: {
    id: 355321,
    name: 'Tormented Insight',
    icon: 'spell_animamaw_orb',
  },
  WHISPERING_SHARD_OF_POWER: {
    id: 355319,
    name: 'A Voice In The Darkness',
    icon: 'inv_belt_cloth_shadowmoonclan_b_01',
  },
  //endregion

  //region Soulrender Dormazain
  DECANTER_OF_ENDLESS_HOWLING: {
    id: 355323,
    name: 'Decanter of Endless Howling',
    icon: 'ability_soulrenderdormazain_hellscream',
  },
  //endregion

  //region Painsmith Raznal
  EBONSOUL_VISE_USE: {
    id: 355327,
    name: 'Ebonsoul Vise',
    icon: 'ability_warlock_improvedsoulleech',
  },
  EBONSOUL_VISE_PASSIVE: {
    id: 357558,
    name: 'Ebonsoul Vise',
    icon: 'ability_warlock_soulswap',
  },
  TORMENTORS_RACK_FRAGMENT: {
    id: 355324,
    name: "Tormentor's Rack Fragment",
    icon: 'ability_warlock_soulswap',
  },
  //endregion

  //region Guardian of the First Ones
  REACTIVE_DEFENSIVE_MATRIX: {
    id: 355329,
    name: 'Reactive Defensive Matrix',
    icon: 'spell_progenitor_orb2',
  },
  SALVAGED_FUSION_AMPLIFIER: {
    id: 355333,
    name: 'Salvaged Fusion Amplifier',
    icon: 'spell_progenitor_missile',
  },
  //endregion

  //region Fatescribe Roh-Kalo
  CARVED_IVORY_KEEPSAKE: {
    // heal and 'fake cast' from Carved Ivory Keepsake trinket
    id: 355985,
    name: 'Intrusive Foresight',
    icon: 'spell_arcane_teleportoribos',
  },
  WEAVE_OF_WARPED_FATES: {
    id: 368205,
    name: 'Unwind Fate',
    icon: 'inv_tailoring_815_synchronousthread',
  },
  //endregion

  //region Kel'Thuzad
  FORBIDDEN_NECROMANTIC_TOME_USE: {
    id: 356212,
    name: 'Forbidden Necromancy',
    icon: 'spell_shadow_raisedead',
  },
  FORBIDDEN_NECROMANTIC_TOME_PASSIVE: {
    id: 356029,
    name: 'Forbidden Knowledge',
    icon: 'inv_misc_book_18',
  },
  RELIC_OF_THE_FROZEN_WASTES_USE: {
    id: 355303,
    name: "Frostlord's Call",
    icon: 'trade_archaeology_nerubianspiderscepter',
  },
  RELIC_OF_THE_FROZEN_WASTES_PASSIVE: {
    id: 355301,
    name: 'Relic of the Frozen Wastes',
    icon: 'spell_deathknight_empowerruneblade2',
  },
  RESONANT_SILVER_BELL: {
    id: 355304,
    name: 'Spectral Feline',
    icon: 'inv_misc_bell_01',
  },
  //endregion

  //region Sylvanas Windrunner
  OLD_WARRIORS_SOUL_HASTE: {
    id: 356492,
    name: 'Undying Rage',
    icon: 'ability_warrior_warcry',
  },
  //endregion
});

export default items;
