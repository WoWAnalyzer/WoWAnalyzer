/**
 * All Shaman abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  ASTRAL_SHIFT: {
    id: 108271,
    name: 'Astral Shift',
    icon: 'ability_shaman_astralshift',
  },
  PURIFY_SPIRIT: {
    id: 77130,
    name: 'Purify Spirit',
    icon: 'ability_shaman_cleansespirit',
    manaCost: 1300,
  },
  WIND_SHEAR: {
    id: 57994,
    name: 'Wind Shear',
    icon: 'spell_nature_cyclone',
  },
  EARTHBIND_TOTEM: {
    id: 2484,
    name: 'Earthbind Totem',
    icon: 'spell_nature_strengthofearthtotem02',
  },
  PURGE: {
    id: 370,
    name: 'Purge',
    icon: 'spell_nature_purge',
  },
  FAR_SIGHT: {
    id: 6196,
    name: 'Far Sight',
    icon: 'spell_nature_farsight',
  },
  WATER_WALKING: {
    id: 546,
    name: 'Water Walking',
    icon: 'spell_frost_windwalkon',
  },
  ASTRAL_RECALL: {
    id: 556,
    name: 'Astral Recall',
    icon: 'spell_nature_astralrecal',
  },
  STATIC_CHARGE_DEBUFF: {
    id: 118905,
    name: 'Static Charge',
    icon: 'spell_nature_brilliance',
  },
  NATURES_GUARDIAN_HEAL: {
    id: 31616,
    name: 'Nature\'s Guardian',
    icon: 'spell_nature_natureguardian',
  },
  TREMOR_TOTEM: {
    id: 8143,
    name: 'Tremor Totem',
    icon: 'spell_nature_tremortotem',
    manaCost: 460,
  },
  SPIRIT_WOLF_BUFF: {
    id: 260881,
    name: 'Spirit Wolf',
    icon: 'spell_hunter_lonewolf',
  },
  EARTH_SHIELD_HEAL: {
    id: 379,
    name: 'Earth Shield',
    icon: 'spell_nature_skinofearth',
  },
  CAPACITOR_TOTEM: {
    id: 192058,
    name: 'Capacitor Totem',
    icon: 'spell_nature_brilliance',
    manaCost: 2000,
  },
  EARTH_ELEMENTAL: {
    id: 198103,
    name: 'Earth Elemental',
    icon: 'spell_nature_earthelemental_totem',
  },
  // Hex and its variations
  HEX: {
    id: 51514,
    name: 'Hex',
    icon: 'spell_shaman_hex',
  },
  HEX_RAPTOR: {
    id: 210873,
    name: 'Hex',
    icon: 'ability_hunter_pet_raptor',
  },
  HEX_SPIDER: {
    id: 211004,
    name: 'Hex',
    icon: 'ability_hunter_pet_spider',
  },
  HEX_SNAKE: {
    id: 211010,
    name: 'Hex',
    icon: 'inv_pet_pythonblack',
  },
  HEX_COCKROACH: {
    id: 211015,
    name: 'Hex',
    icon: 'inv_pet_cockroach',
  },
  HEX_SKELETAL: {
    id: 269352,
    name: 'Hex',
    icon: 'ability_mount_fossilizedraptor',
  },
  //Eye of the Twisting Nether Buffs
  SHOCK_OF_THE_TWISTING_NETHER: {
    id: 207999,
    name: 'Shock of the Twisting Nether',
    icon: 'spell_nature_rune',
  },
  FIRE_OF_THE_TWISTING_NETHER: {
    id: 207995,
    name: 'Fire of the Twisting Nether',
    icon: 'spell_fire_rune',
  },
  CHILL_OF_THE_TWISTING_NETHER: {
    id: 207998,
    name: 'Chill of the Twisting Nether',
    icon: 'spell_ice_rune',
  },
  // Elemental Shaman
  ELEMENTAL_MASTERY: {
    id: 168534,
    name: 'Elemental Overload',
    icon: 'spell_nature_lightningoverload',
  },
  Resonance_Totem: {
    id: 202192,
    name: 'Resonance Totem',
    icon: 'spell_nature_stoneskintotem',
  },
  EARTH_SHOCK: {
    id: 8042,
    name: 'Earth Shock',
    icon: 'spell_nature_earthshock',
  },
  LAVA_BURST: {
    id: 51505,
    name: 'Lava Burst',
    icon: 'spell_shaman_lavaburst',
    manaCost: 1200,
  },
  LAVA_BURST_OVERLOAD: {
    id: 77451,
    name: 'Lava Burst Overload',
    icon: 'spell_shaman_lavaburst',
  },
  LIGHTNING_BOLT: {
    id: 188196,
    name: 'Lightning Bolt',
    icon: 'spell_nature_lightning',
  },
  LIGHTNING_BOLT_INSTANT: {
    id: 214815,
    name: 'Lightning Bolt',
    icon: 'spell_nature_lightning',
  },
  LIGHTNING_BOLT_OVERLOAD: {
    id: 214816,
    name: 'Lightning Bolt Overload',
    icon: 'spell_nature_lightning',
  },
  LIGHTNING_BOLT_OVERLOAD_HIT: {
    id: 45284,
    name: 'Lightning Bolt Overload',
    icon: 'spell_nature_lightning',
  },
  ELEMENTAL_BLAST_OVERLOAD: {
    id: 120588,
    name: 'Elemental Blast',
    icon: 'shaman_talent_elementalblast',
  },
  ELEMENTAL_BLAST_HASTE: {
    id: 173183,
    name: 'Elemental Blast: Haste',
    icon: 'shaman_talent_elementalblast',
  },
  ELEMENTAL_BLAST_CRIT: {
    id: 118522,
    name: 'Elemental Blast: Critical Strike',
    icon: 'shaman_talent_elementalblast',
  },
  ELEMENTAL_BLAST_MASTERY: {
    id: 173184,
    name: 'Elemental Blast: Mastery',
    icon: 'shaman_talent_elementalblast',
  },
  TAILWIND_TOTEM: {
    id: 210660,
    name: 'Totem Mastery: Tailwind Totem',
    icon: 'spell_nature_invisibilitytotem',
  },
  LIQUID_MAGMA_TOTEM_DAMAGE: {
    id: 192231,
    name: 'Liquid Magma Totem Damage',
    icon: 'spell_shaman_spewlava',
  },
  EARTHEN_RAGE_DAMAGE: {
    id: 170379,
    name: 'Earthen Rage Damage',
    icon: 'ability_earthen_pillar',
  },
  CHAIN_LIGHTNING: {
    id: 188443,
    name: 'Chain Lightning',
    icon: 'spell_nature_chainlightning',
  },
  CHAIN_LIGHTNING_INSTANT: {
    id: 195897,
    name: 'Chain Lightning',
    icon: 'spell_nature_chainlightning',
  },
  CHAIN_LIGHTNING_OVERLOAD: {
    id: 45297,
    name: 'Chain Lightning Overload',
    icon: 'spell_nature_chainlightning',
  },
  CHAIN_LIGHTNING_OVERLOAD_UNLIMITED_RANGE: {
    id: 218558,
    name: 'Chain Lightning Overload',
    icon: 'spell_nature_chainlightning',
  },
  LAVA_BEAM: {
    id: 114074,
    name: 'Lava Beam',
    icon: 'ability_mage_firestarter',
  },
  LAVA_BEAM_OVERLOAD: {
    id: 114738,
    name: 'Lava Beam Overload',
    icon: 'spell_fire_soulburn',
  },
  LAVA_BEAM_INSTANT: {
    id: 217891,
    name: 'Lava Beam',
    icon: 'ability_mage_firestarter',
  },
  LAVA_BEAM_OVERLOAD_INSTANT: {
    id: 218559,
    name: 'Lava Beam Overload',
    icon: 'spell_fire_soulburn',
  },
  EARTHQUAKE: {
    id: 61882,
    name: 'Earthquake',
    icon: 'spell_shaman_earthquake',
    maelstrom: 50,
  },
  EARTHQUAKE_DAMAGE: {
    id: 77478,
    name: 'Earthquake',
    icon: 'spell_shaman_earthquake',
  },
  EARTHQUAKE_SEISMIC_LIGHTNING: {
    id: 243073,
    name: 'Seismic Lightning',
    icon: 'inv_misc_stormlordsfavor',
  },
  EARTHQUAKE_CAST_TARGET: {
    id: 182387,
    name: 'Earthquake',
    icon: 'spell_shaman_earthquake',
  },
  EARTHQUAKE_STUNS: {
    id: 77505,
    name: 'Earthquake',
    icon: 'spell_shaman_earthquake',
  },
  FIRE_ELEMENTAL: {
    id: 198067,
    name: 'Fire Elemental',
    icon: 'spell_fire_elemental_totem',
  },
  SUMMON_FIRE_ELEMENTAL: {
    id: 263819,
    name: 'Fire Elemental',
    icon: 'spell_fire_elemental_totem',
  },
  FLAME_SHOCK: {
    id: 188389,
    name: 'Flame Shock',
    icon: 'spell_fire_flameshock',
    max_maelstrom: 20,
  },
  FROST_SHOCK: {
    id: 196840,
    name: 'Frost Shock',
    icon: 'spell_frost_frostshock',
    max_maelstrom: 20,
  },
  ICEFURY_OVERLOAD: {
    id: 219271,
    name: 'Icefury Overload',
    icon: 'spell_frost_iceshard',
  },
  LAVA_SURGE: {
    id: 77762,
    name: 'Lava Surge',
    icon: 'spell_shaman_lavasurge',
  },
  AFTERSHOCK: {
    id: 210712,
    name: 'Aftershock',
    icon: 'spell_nature_stormreach',
  },
  EXPOSED_ELEMENTS_TALENT_DEBUFF: {
    id: 269808,
    name: "Exposed Elements Debuff",
    icon: "spell_nature_callstorm",
  },
  MASTER_OF_THE_ELEMENTS_BUFF: {
    id: 260734,
    name: "Master Of The Elements Buff",
    icon: "spell_nature_elementalabsorption",
  },
  UNLIMITED_POWER_BUFF: {
    id: 272737,
    name: "Unlimited Power Buff",
    icon: "ability_shaman_ascendance",
  },
  // Elemental Pet Spells
  WIND_GUST: {
    id: 157331,
    name: 'Wind Gust',
    icon: 'spell_nature_cyclone',
  },
  WIND_GUST_BUFF: {
    id: 263806,
    name: 'Wind Gust Buff',
    icon: 'spell_nature_cyclone',
  },
  EYE_OF_THE_STORM: {
    id: 157375,
    name: 'Eye Of The Storm',
    icon: 'inv_elemental_primal_air',
  },
  CALL_LIGHTNING: {
    id: 157348,
    name: 'Call Lightning',
    icon: 'ability_vehicle_electrocharge',
  },
  FIRE_ELEMENTAL_METEOR: {
    id: 117588,
    name: 'Meteor',
    icon: 'spell_mage_meteor',
  },
  FIRE_ELEMENTAL_FIRE_BLAST: {
    id: 57984,
    name: 'Fire Elemental Fire Blast',
    icon: 'spell_fire_fireball',
  },
  FIRE_ELEMENTAL_IMMOLATE: {
    id: 118297,
    name: 'Fire Elemental Immolate',
    icon: 'spell_fire_immolation',
  },
  // Enhancement Shaman
  ROCKBITER: {
    id: 193786,
    name: 'Rockbiter',
    icon: 'spell_nature_rockbiter',
  },
  FROSTBRAND: {
    id: 196834,
    name: 'Frostbrand',
    icon: 'spell_shaman_unleashweapon_frost',
  },
  FLAMETONGUE: {
    id: 193796,
    name: 'Flametongue',
    icon: 'spell_fire_flametounge',
  },
  FLAMETONGUE_BUFF: {
    id: 194084,
    name: 'Flametongue',
    icon: 'spell_fire_flametounge',
  },
  CRASH_LIGHTNING: {
    id: 187874,
    name: 'Crash Lightning',
    icon: 'spell_shaman_crashlightning',
    maelstrom: 20,
  },
  FERAL_SPIRIT: {
    id: 51533,
    name: 'Feral Spirit',
    icon: 'spell_shaman_feralspirit',
  },
  FERAL_SPIRIT_MAELSTROM_BUFF: {
    id: 190185,
    name: 'Feral Spirit',
    icon: 'spell_shaman_feralspirit',
  },
  ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON: {
    id: 224125,
    name: 'Molten Weapon',
    icon: 'item_summon_cinderwolf',
  },
  ELEMENTAL_SPIRITS_BUFF_ICY_EDGE: {
    id: 224126,
    name: 'Icy Edge',
    icon: 'inv_mount_spectralwolf',
  },
  ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE: {
    id: 224127,
    name: 'Crackling Surge',
    icon: 'spell_beastmaster_wolf',
  },
  STORMSTRIKE: {
    id: 17364,
    name: 'Stormstrike',
    icon: 'ability_shaman_stormstrike',
    maelstrom: 40,
  },
  STORMSTRIKE_BUFF: {
    id: 32175,
    name: 'Stormstrike',
    icon: 'ability_shaman_stormstrike',
  },
  LAVA_LASH: {
    id: 60103,
    name: 'Lava Lash',
    icon: 'ability_shaman_lavalash',
    maelstrom: 30,
  },
  DOOM_WINDS: {
    id: 204945,
    name: 'Doom Winds',
    icon: 'inv_mace_1h_artifactdoomhammer_d_01',
  },
  STORMBRINGER: {
    id: 201845,
    name: 'Stormbringer',
    icon: 'spell_nature_stormreach',
  },
  MAELSTROM_WEAPON: {
    id: 187890,
    name: 'Maelstrom Weapon',
    icon: 'spell_shaman_maelstromweapon',
  },
  WINDSTRIKE: {
    id: 115356,
    name: 'Windstrike',
    icon: 'ability_skyreach_four_wind',
    maelstrom: 10, // 30 Maelstrom - 66% (20) = 10
  },
  DOOM_VORTEX: {
    id: 199116,
    name: 'Doom Vortex',
    icon: 'ability_shaman_stormstrike',
  },
  GHOST_WOLF: {
    id: 2645,
    name: 'Ghost Wolf',
    icon: 'spell_nature_spiritwolf',
  },
  HEALING_SURGE_ENHANCE: {
    id: 188070,
    name: 'Healing Surge',
    icon: 'spell_nature_healingway',
    baseMana: 0.22,
    maelstrom: 20,
  },
  LIGHTNING_BOLT_ENHANCE: {
    name: "Lightning Bolt",
    id: 187837,
    abilityIcon: "spell_nature_lightning.jpg",
  },
  FERAL_LUNGE: {
    id: 196881,
    name: 'Feral Lunge',
    icon: 'spell_beastmaster_wolf',
  },
  FERAL_LUNGE_DAMAGE: {
    id: 215802,
    name: 'Feral Lunge',
    icon: 'spell_beastmaster_wolf',
  },
  BLOODLUST: {
    id: 2825,
    name: 'Bloodlust',
    icon: 'spell_nature_bloodlust',
    baseMana: 0.215,
  },
  HEROISM: {
    id: 32182,
    name: 'Heroism',
    icon: 'ability_shaman_heroism',
    baseMana: 0.215,
  },
  REINCARNATION: {
    id: 21169,
    name: 'Reincarnation',
    icon: 'spell_shaman_improvedreincarnation',
  },
  SPIRIT_WALK: {
    id: 58875,
    name: 'Spirit Walk',
    icon: 'ability_tracking',
  },
  WINDLASH: {
    id: 114089,
    name: 'Windlash',
    icon: 'spell_nature_cyclone',
  },
  STORMLASH: {
    id: 195256,
    name: 'Stormlash',
    icon: 'spell_lightning_lightningbolt01',
  },
  WINDLASH_OFFHAND: {
    id: 114093,
    name: 'Windlash Off-Hand',
    icon: 'spell_nature_cyclone',
  },
  WINDFURY_ATTACK: {
    id: 25504,
    name: 'Windfury Attack',
    icon: 'spell_shaman_unleashweapon_wind',
  },
  ELEMENTAL_HEALING: {
    id: 198249,
    name: 'Elemental Healing',
    icon: 'spell_shaman_improvedreincarnation',
  },
  UNLEASH_LAVA: {
    id: 199053,
    name: 'Unleash Lava',
    icon: 'ability_shaman_stormstrike',
  },
  UNLEASH_LIGHTNING: {
    id: 199054,
    name: 'Unleash Lightning',
    icon: 'ability_shaman_stormstrike',
  },
  FLAMETONGUE_ATTACK: {
    id: 10444,
    name: 'Flametongue Attack',
    icon: 'spell_shaman_unleashweapon_flame',
  },
  WINDSTRIKE_OFFHAND: {
    id: 115360,
    name: 'Windstrike Off-Hand',
    icon: 'ability_skyreach_four_wind',
  },
  STORMSTRIKE_OFFHAND: {
    id: 32176,
    name: 'Stormstrike Off-Hand',
    icon: 'ability_shaman_stormstrike',
  },
  CRASH_LIGHTNING_BUFF: {
    id: 195592,
    name: 'Crash Lightning',
    icon: 'spell_shaman_crashlightning',
  },
  WINDSTRIKE_BUFF: {
    id: 115357,
    name: 'Windstrike',
    icon: 'ability_skyreach_four_wind',
  },
  SPIRIT_OF_THE_MAELSTROM: {
    id: 204880,
    name: 'Spirit of the Maelstrom',
    icon: 'ability_shaman_freedomwolf',
  },
  FURY_OF_AIR_BUFF: {
    id: 197385,
    name: 'Fury of Air',
    icon: 'ability_ironmaidens_swirlingvortex',
  },
  WINDFURY_ATTACK_BUFF: {
    id: 204608,
    name: 'Windfury Attack',
    icon: 'spell_shaman_unleashweapon_wind',
  },
  CRASHING_STORM_BUFF: {
    id: 210801,
    name: 'Crashing Storm',
    icon: 'spell_nature_unrelentingstorm',
  },
  HAILSTORM_BUFF: {
    id: 210854,
    name: 'Hailstorm',
    icon: 'spell_frost_frostbrand',
  },
  LANDSLIDE_BUFF: {
    id: 202004,
    name: 'Landslide',
    icon: 'inv_ore_blackrock_nugget',
  },
  LIGHTNING_SHIELD_OVERCHARGE:{
    id: 273323,
    name: 'Lightning Shield Overcharge',
    icon: 'spell_nature_lightningshield',
  },
  FORCEFUL_WINDS_BUFF: {
    id: 262652,
    name: 'Forceful Winds Buff',
    icon: 'spell_shaman_unleashweapon_wind',
  },
  SEARING_ASSAULT_DAMAGE: {
    id: 268429,
    name: 'Searing Assault Damage',
    icon: 'ability_rhyolith_magmaflow_wave',
  },
  HOT_HAND_BUFF: {
    id: 215785,
    name: 'Hot Hand Buff',
    icon: 'spell_fire_playingwithfire',
  },
  // Restoration Shaman
  CHAIN_HEAL: {
    id: 1064,
    name: 'Chain Heal',
    icon: 'spell_nature_healingwavegreater',
    manaCost: 5000,
    color: '#203755',
    coefficient: 1.4,
  },
  HEALING_WAVE: {
    id: 77472,
    name: 'Healing Wave',
    icon: 'spell_nature_healingwavelesser',
    manaCost: 1800,
    color: '#146585',
    coefficient: 1.55,
  },
  HEALING_SURGE_RESTORATION: {
    id: 8004,
    name: 'Healing Surge',
    icon: 'spell_nature_healingway',
    manaCost: 3800,
    color: '#40b3bf',
    coefficient: 1.43,
  },
  RIPTIDE: {
    id: 61295,
    name: 'Riptide',
    icon: 'spell_nature_riptide',
    manaCost: 1600,
    color: '#a3dbce',
  },
  TIDAL_WAVES_BUFF: {
    id: 53390,
    name: 'Tidal Waves',
    icon: 'spell_shaman_tidalwaves',
  },
  HEALING_RAIN_CAST: {
    id: 73920,
    name: 'Healing Rain',
    icon: 'spell_nature_giftofthewaterspirit',
    manaCost: 4320,
  },
  HEALING_RAIN_HEAL: {
    id: 73921,
    name: 'Healing Rain',
    icon: 'spell_nature_giftofthewaterspirit',
  },
  HEALING_STREAM_TOTEM_CAST: {
    id: 5394,
    name: 'Healing Stream Totem',
    icon: 'inv_spear_04',
    manaCost: 2200,
  },
  HEALING_STREAM_TOTEM_HEAL: {
    id: 52042,
    name: 'Healing Stream Totem',
    icon: 'inv_spear_04',
  },
  HEALING_TIDE_TOTEM_CAST: {
    id: 108280,
    name: 'Healing Tide Totem',
    icon: 'ability_shaman_healingtide',
    manaCost: 1120,
  },
  HEALING_TIDE_TOTEM_HEAL: {
    id: 114942,
    name: 'Healing Tide Totem',
    icon: 'ability_shaman_healingtide',
    coefficient: 0.24,
  },
  ASCENDANCE_HEAL: {
    id: 114083,
    name: 'Ascendance',
    icon: 'spell_fire_elementaldevastation',
  },
  SPIRIT_LINK_TOTEM: {
    id: 98008,
    name: 'Spirit Link Totem',
    icon: 'spell_shaman_spiritlink',
    manaCost: 2200,
  },
  SPIRIT_LINK_TOTEM_REDISTRIBUTE: {
    id: 98021,
    name: 'Spirit Link Totem',
    icon: 'spell_shaman_spiritlink',
  },
  CLOUDBURST_TOTEM_HEAL: {
    id: 157503,
    name: 'Cloudburst',
    icon: 'ability_shaman_condensationtotem',
  },
  CLOUDBURST_TOTEM_RECALL: {
    id: 201764,
    name: 'Recall Cloudburst Totem',
    icon: 'ability_shaman_condensationtotem',
  },
  EARTHEN_WALL_TOTEM_ABSORB: {
    id: 201633,
    name: 'Earthen Wall Totem',
    icon: 'spell_nature_stoneskintotem',
  },
  EARTHEN_WALL_TOTEM_SELF_DAMAGE: {
    id: 201657,
    name: 'Earthen Wall Totem',
    icon: 'spell_nature_stoneskintotem',
  },
  DEEP_HEALING: {
    id: 77226,
    name: 'Mastery: Deep Healing',
    icon: 'spell_nature_healingtouch',
  },
  ANCESTRAL_VIGOR: {
    id: 207400,
    name: 'Ancestral Vigor',
    icon: 'spell_shaman_blessingoftheeternals',
  },
  SPIRITWALKERS_GRACE: {
    id: 79206,
    name: 'Spiritwalker\'s Grace',
    icon: 'spell_shaman_spiritwalkersgrace',
    manaCost: 2820,
  },
  WELLSPRING_HEAL: {
    id: 197997,
    name: 'Wellspring',
    icon: 'ability_shawaterelemental_split',
  },
  FLAME_SHOCK_RESTORATION: {
    id: 188838,
    name: 'Flame Shock',
    icon: 'spell_fire_flameshock',
    manaCost: 3000,
  },
  LIGHTNING_BOLT_RESTORATION: {
    id: 403,
    name: 'Lightning Bolt',
    icon: 'spell_nature_lightning',
  },
  CHAIN_LIGHTNING_RESTORATION: {
    id: 421,
    name: 'Chain Lightning',
    icon: 'spell_nature_chainlightning',
  },
  RESURGENCE: {
    id: 101033,
    name: 'Resurgence',
    icon: 'ability_shaman_watershield',
  },
  UNDULATION_BUFF: {
    id: 216251,
    name: 'Undulation',
    icon: 'spell_nature_healingwavelesser',
  },
  FLASH_FLOOD_BUFF: {
    id: 280615,
    name: 'Flash Flood',
    icon: 'spell_frost_summonwaterelemental',
  },
  TOTEMIC_REVIVAL_DEBUFF: {
    id: 255234,
    name: 'Totemic Revival',
    icon: 'spell_nature_reincarnation',
  },
  TOTEMIC_REVIVAL_CAST: {
    id: 207553,
    name: 'Totemic Revival',
    icon: 'spell_shaman_improvedreincarnation',
  },
  HIGH_TIDE_BUFF: {
    id: 288675,
    name: 'High Tide',
    icon: 'spell_shaman_hightide',
    coefficient: 1.68,
  },
};
