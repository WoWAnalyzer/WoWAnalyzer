/**
 * Anything that isn't a class specific ability nor a racial goes in here. You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // General:
  MELEE: {
    id: 1,
    name: 'Melee',
    icon: 'inv_axe_02',
  },
  LEECH: {
    id: 143924,
    name: 'Leech',
    icon: 'spell_shadow_lifedrain02',
  },
  ANCIENT_HEALING_POTION: {
    id: 188016,
    name: 'Ancient Healing Potion',
    icon: 'inv_alchemy_70_red',
  },
  POTION_OF_PROLONGED_POWER: {
    id: 229206,
    name: 'Potion of Prolonged Power',
    icon: 'trade_alchemy_dpotion_a28',
  },
  POTION_OF_THE_OLD_WAR: {
    id: 188028,
    name: 'Potion of the Old War',
    icon: 'inv_alchemy_70_orange',
  },
  POTION_OF_DEADLY_GRACE: {
    id: 188027,
    name: 'Potion of Deadly Grace',
    icon: 'inv_alchemy_70_flask02',
  },
  LEYTORRENT_POTION: {
    id: 188030,
    name: 'Leytorrent Potion',
    icon: 'inv_alchemy_70_flask01',
  },
  ANCIENT_MANA_POTION: {
    id: 188017,
    name: 'Ancient Mana Potion',
    icon: 'inv_alchemy_70_blue',
  },
  UNBENDING_POTION: {
    id: 127845,
    name: 'Unbending Potion',
    icon: 'inv_alchemy_70_flask04',
  },
  SPIRIT_BERRIES: {
    id: 223573,
    name: 'Spirit Berries',
    icon: 'inv_misc_food_93_skethylberries',
  },
  PURE_RAGE_POTION: {
    id: 175821,
    name: 'Pure Rage Potion',
    icon: 'trade_alchemy_dpotion_a13',
  },
  SUNFRUIT: {
    id: 223595,
    name: 'Sunfruit',
    icon: 'inv_misc_food_42',
  },
  HEALTHSTONE: {
    id: 6262,
    name: 'Healthstone',
    icon: 'warlock_healthstone',
  },
  ANCIENT_REJUVENATION_POTION: {
    id: 188018,
    name: 'Ancient Rejuvenation Potion',
    icon: 'inv_alchemy_70_purple',
  },
  // Items buffs:
  JACINS_RUSE: {
    id: 224149,
    name: 'Jacin\'s Ruse',
    icon: 'sha_ability_rogue_bloodyeye',
  },
  GNAWED_THUMB_RING: {
    id: 228461,
    name: 'Gnawed Thumb Ring',
    icon: 'inv_70_dungeon_ring6a',
    cooldownType: 'HEALING',
  },
  VELENS_FUTURE_SIGHT: {
    id: 235966,
    name: 'Velen\'s Future Sight',
    icon: 'spell_holy_healingfocus',
    cooldownType: 'HEALING',
  },
  XAVARICS_MAGNUM_OPUS: {
    id: 207472,
    name: 'Xavaric\'s Magnum Opus',
    icon: 'ability_vehicle_shellshieldgenerator',
  },
  FRAGILE_ECHO_ENERGIZE: {
    id: 215270,
    name: 'Fragile Echo',
    icon: 'spell_warlock_demonsoul',
  },
  FRAGILE_ECHO_BUFF: {
    id: 215267,
    name: 'Fragile Echo',
    icon: 'spell_warlock_demonsoul',
  },
  XAVARICS_MAGNUM_OPUS_HEAL: {
    id: 207472,
    name: 'Xavaric\'s Magnum Opus',
    icon: 'ability_vehicle_shellshieldgenerator',
  },
  MARK_OF_THE_ACNIENT_PRIESTESS: {
    id: 228401,
    name: 'Mark of the Ancient Priestess',
    icon: 'ability_priest_ascension',
  },
  MARK_OF_THE_HIDDEN_SATYR: {
    id: 191259,
    name: 'Mark of the Hidden Satyr',
    icon: 'sha_spell_fire_fireball02_nightmare',
  },
  //Nighthold Trinkets
  RECURSIVE_STRIKES: {
    id: 225739,
    name: 'Recursive Strikes',
    icon: 'sha_ability_mage_firestarter_nightborne',
  },
  // Tomb trinkets
  CLEANSING_MATRIX: {
    id: 242619,
    name: 'Cleansing Matrix',
    icon: 'inv__wod_arakoa4',
  },
  AOF_INFUSION_OF_LIGHT: {
    id: 242621,
    name: 'Infusion of Light',
    icon: 'spell_shadow_mindshear',
  },
  GUILTY_CONSCIENCE: {
    id: 242327,
    name: 'Guilty Conscience',
    icon: 'spell_shadow_mindshear',
  },
  GUIDING_HAND: {
    id: 242622,
    name: 'Guiding Hand',
    icon: 'spell_shadow_mindshear',
  },
  FRUITFUL_MACHINATIONS: {
    id: 242623,
    name: 'Fruitful Machinations',
    icon: 'spell_shadow_mindshear',
  },
  OCEANS_EMBRACE: {
    id: 242474,
    name: 'Ocean\'s Embrace',
    icon: 'inv_jewelcrafting_starofelune_02',
  },
  CEASELESS_TOXIN: {
    id: 242497,
    name: 'Ceaseless Toxin',
    icon: 'inv_potionc_5',
  },
  SUMMON_DREAD_REFLECTION: {
    id: 246461,
    name: 'Summon Dread Reflection',
    icon: 'spell_warlock_soulburn',
  },
  DREAD_TORRENT: {
    id: 246464,
    name: 'Dread Torrent',
    icon: 'spell_warlock_soulburn',
  },
  // Item Abilities
  SPECTRAL_OWL: {
    id: 242570,
    name: 'Spectral Owl',
    icon: 'inv_jewelcrafting_purpleowl',
  },
  SPECTRAL_BLAST: {
    id: 246442,
    name: 'Spectral Blast',
    icon: 'inv_axe_02',
  },
  SPECTRAL_BOLT: {
    id: 242571,
    name: 'Spectral Bolt',
    icon: 'ability_thunderking_thunderstruck',
  },
  SPECTRAL_THURIBLE_DAMAGE: {
    id: 246751,
    name: 'Piercing Anguish',
    icon: 'inv_spear_08',
  },
  TERROR_FROM_BELOW_DAMAGE: {
    id: 242525,
    name: 'Terror From Below',
    icon: 'trade_archaeology_sharkjaws',
  },
  TOME_OF_UNRAVELING_SANITY_DAMAGE: {
    id: 243941,
    name: 'Insidious Corruption',
    icon: 'inv_archaeology_70_demon_flayedskinchronicle',
  },
  //Engine of Eradication buff
  DEMONIC_VIGOR: {
    id: 242612,
    name: 'Demonic Vigor',
    icon: 'inv_relics_warpring',
  },
  MARCH_OF_THE_LEGION: {
    id: 228446,
    name: 'March of the Legion',
    icon: 'ability_warlock_fireandbrimstone',
  },
  KILJAEDENS_BURNING_WISH_DAMAGE: {
    id: 235999,
    name: 'Kil\'jaeden\'s Burning Wish',
    icon: 'sha_spell_fire_bluepyroblast_nightmare',
  },
  KILJAEDENS_BURNING_WISH_CAST: {
    id: 235991,
    name: 'Kil\'jaeden\'s Burning Wish',
    icon: 'sha_spell_fire_bluepyroblast_nightmare',
  },
  ARCHIMONDES_HATRED_REBORN_ABSORB: {
    id: 235169,
    name: 'Archimonde\'s Hatred Reborn',
    icon: 'spell_nature_elementalshields',
  },
  DRUMS_OF_FURY: {
    id: 178207,
    name: 'Drums of Fury',
    icon: 'inv_misc_drum_01',
  },
  DRUMS_OF_RAGE: {
    id: 146555,
    name: 'Drums of Rage',
    icon: 'inv_misc_drum_05',
  },
  DRUMS_OF_THE_MOUNTAIN: {
    id: 230935,
    name: 'Drums of the Mountain',
    icon: 'inv_archaeology_70_tauren_drum',
  },
  // Cinidaria
  SYMBIOTE_STRIKE: {
    id: 207694,
    name: 'Symbiote Strike',
    icon: 'inv_leather_raiddruid_m_01belt',
  },

  // Encounter mechanics
  RECURSIVE_STRIKES_ENEMY: {
    id: 218508,
    name: 'Recursive Strikes',
    icon: 'ability_mage_massinvisibility',
  },
  MAGIC_MELEE: {
    id: -32, // No idea why it's negative, but adds with "magic melee attacks" (eels on Mistress/tank add on KJ melee) cast an ability with this ID
    name: 'Melee',
    icon: 'inv_axe_02',
  },
};
