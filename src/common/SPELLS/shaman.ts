/**
 * All Shaman abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */
import Spell from 'common/SPELLS/Spell';

const spells = {
  WATER_SHIELD: {
    id: 52127,
    name: 'Water Shield',
    icon: 'ability_shaman_watershield',
  },
  EARTH_SHOCK_OVERLOAD: {
    id: 381725,
    name: 'Earth Shock Overload',
    icon: 'spell_nature_earthshock',
  },
  FUSION_OF_THE_ELEMENTS_NATURE_BUFF: {
    id: 462841,
    name: 'Fusion of Elements',
    icon: 'inv_10_enchanting2_elementalswirl_color1',
  },
  FUSION_OF_THE_ELEMENTS_FIRE_BUFF: {
    id: 462843,
    name: 'Fusion of Elements',
    icon: 'inv_10_enchanting2_elementalswirl_color1',
  },
  PURIFY_SPIRIT: {
    id: 77130,
    name: 'Purify Spirit',
    icon: 'ability_shaman_cleansespirit',
    manaCost: 3250,
  },
  EARTHBIND_TOTEM: {
    id: 2484,
    name: 'Earthbind Totem',
    icon: 'spell_nature_strengthofearthtotem02',
    manaCost: 1250,
  },
  RESONANCE_TOTEM_HASTE: {
    id: 262417,
    name: 'Resonance Totem',
    icon: 'spell_nature_stoneskintotem',
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
    name: "Nature's Guardian",
    icon: 'spell_nature_natureguardian',
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
  EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF: {
    id: 383648,
    name: 'Earth Shield',
    icon: 'spell_nature_skinofearth',
  },
  LIGHTNING_SHIELD: {
    id: 192106,
    name: 'Lightning Shield',
    icon: 'spell_nature_lightningshield',
    manaCost: 750,
  },
  LIGHTNING_SHIELD_ELEMENTAL: {
    id: 344174, // Appears to be the spellID used when lightning shield does damage as Elemental Spec
    name: 'Lightning Shield',
    icon: 'spell_nature_lightningshield',
    manaCost: 750,
  },
  PRIMAL_STRIKE: {
    id: 73899,
    name: 'Primal Strike',
    icon: 'spell_shaman_primalstrike',
    manaCost: 4700,
  },
  ANCESTRAL_PROTECTION_BUFF: {
    id: 207495,
    name: 'Ancestral Protection',
    icon: 'spell_nature_reincarnation',
  },
  // Hex and its variations
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
  RESONANCE_TOTEM_FULMINATION: {
    id: 202192,
    name: 'Resonance Totem',
    icon: 'spell_nature_stoneskintotem',
  },
  LAVA_BURST_DAMAGE: {
    id: 285452,
    name: 'Lava Burst',
    icon: 'spell_shaman_lavaburst',
  },
  LAVA_BURST_OVERLOAD: {
    id: 77451,
    name: 'Lava Burst Overload',
    icon: 'spell_shaman_lavaburst',
  },
  LAVA_BURST_OVERLOAD_DAMAGE: {
    id: 285466,
    name: 'Lava Burst Overload',
    icon: 'spell_shaman_lavaburst',
  },
  LIGHTNING_BOLT: {
    id: 188196,
    name: 'Lightning Bolt',
    icon: 'spell_nature_lightning',
    manaCost: 500,
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
  ELEMENTAL_BLAST: {
    id: 117014,
    name: 'Elemental Blast',
    icon: 'shaman_talent_elementalblast',
  },
  ELEMENTAL_BLAST_OVERLOAD: {
    id: 120588,
    name: 'Elemental Blast Overload',
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
  FLAME_SHOCK: {
    id: 188389,
    name: 'Flame Shock',
    icon: 'spell_fire_flameshock',
  },
  FROST_SHOCK_ENERGIZE: {
    icon: 'spell_frost_frostshock',
    id: 289439,
    name: 'Frost Shock',
  },
  ICEFURY_OVERLOAD: {
    id: 219271,
    name: 'Icefury Overload',
    icon: 'spell_frost_iceshard',
  },
  ICEFURY: {
    id: 210714,
    name: 'Icefury',
    icon: 'spell_frost_iceshard',
  },
  // NYI in game
  ICEFURY_CASTABLE_BUFF: {
    id: 462818,
    name: 'Icefury',
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
  MASTER_OF_THE_ELEMENTS_BUFF: {
    id: 260734,
    name: 'Master Of The Elements Buff',
    icon: 'spell_nature_elementalabsorption',
  },
  SURGE_OF_POWER_BUFF: {
    id: 285514,
    name: 'Surge of Power',
    icon: 'spell_nature_shamanrage',
  },
  UNLIMITED_POWER_BUFF: {
    id: 272737,
    name: 'Unlimited Power Buff',
    icon: 'ability_shaman_ascendance',
  },
  STORMKEEPER_BUFF_AND_CAST: {
    id: 191634,
    name: 'Stormkeeper',
    icon: 'ability_thunderking_lightningwhip',
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
  FIRE_ELEMENTAL_BUFF: {
    id: 188592,
    name: 'Fire Elemental',
    icon: 'spell_fire_elemental_totem',
  },
  // Enhancement Shaman
  FERAL_SPIRIT_LIGHTNING_TIER: {
    id: 363933,
    name: 'Feral Spirit',
    icon: 'spell_shaman_feralspirit',
  },
  FERAL_SPIRIT_FIRE_TIER: {
    id: 363928,
    name: 'Feral Spirit',
    icon: 'spell_shaman_feralspirit',
  },
  FERAL_SPIRIT_FROST_TIER: {
    id: 363932,
    name: 'Feral Spirit',
    icon: 'spell_shaman_feralspirit',
  },
  FERAL_SPIRIT_TIER: {
    id: 363941,
    name: 'Feral Spirit',
    icon: 'spell_shaman_feralspirit',
  },
  FERAL_SPIRIT_MAELSTROM_BUFF: {
    id: 333957,
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
  FERAL_SPIRIT_BUFF_EARTHEN_WEAPON: {
    id: 392375,
    name: 'Earthen Weapon',
    icon: 'spell_shaman_unleashweapon_earth',
  },
  STORMSTRIKE_DAMAGE: {
    id: 32175,
    name: 'Stormstrike',
    icon: 'ability_shaman_stormstrike',
  },
  STORMSTRIKE_DAMAGE_OFFHAND: {
    id: 32176,
    name: 'Stormstrike Off-Hand',
    icon: 'ability_shaman_stormstrike',
  },
  ASCENDANCE_INITIAL_DAMAGE: {
    id: 344548,
    name: 'Ascendance',
    icon: 'spell_fire_elementaldevastation',
  },
  WINDSTRIKE_CAST: {
    id: 115356,
    name: 'Windstrike',
    icon: 'ability_skyreach_four_wind',
  },
  WINDSTRIKE_DAMAGE: {
    id: 115357,
    name: 'Windstrike',
    icon: 'ability_skyreach_four_wind',
  },
  WINDSTRIKE_DAMAGE_OFFHAND: {
    id: 115360,
    name: 'Windstrike Off-Hand',
    icon: 'ability_skyreach_four_wind',
  },
  FIRE_NOVA_DAMAGE: {
    id: 333977,
    name: 'Fire Nova',
    icon: 'spell_shaman_improvedfirenova',
  },
  STORMBRINGER_BUFF: {
    id: 201846,
    name: 'Stormbringer Buff',
    icon: 'spell_nature_stormreach',
  },
  MAELSTROM_WEAPON: {
    id: 187890,
    name: 'Maelstrom Weapon',
    icon: 'spell_shaman_maelstromweapon',
  },
  MAELSTROM_WEAPON_BUFF: {
    id: 344179,
    name: 'Maelstrom Weapon',
    icon: 'spell_shaman_maelstromweapon',
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
  FERAL_LUNGE: {
    id: 196884,
    name: 'Feral Lunge',
    icon: 'spell_beastmaster_wolf.jpg',
  },
  FERAL_LUNGE_NOT_A_CAST: {
    id: 196881,
    name: 'Feral Lunge',
    icon: 'spell_beastmaster_wolf.jpg',
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
    manaCost: 1000,
  },
  HEROISM: {
    id: 32182,
    name: 'Heroism',
    icon: 'ability_shaman_heroism',
    manaCost: 1000,
  },
  REINCARNATION: {
    id: 21169,
    name: 'Reincarnation',
    icon: 'spell_shaman_improvedreincarnation',
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
  SKYFURY: {
    id: 462854,
    name: 'Skyfury',
    icon: 'achievement_raidprimalist_windelemental',
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
  CRASH_LIGHTNING_BUFF: {
    id: 195592,
    name: 'Crash Lightning',
    icon: 'spell_shaman_crashlightning',
  },
  SPIRIT_OF_THE_MAELSTROM: {
    id: 204880,
    name: 'Spirit of the Maelstrom',
    icon: 'ability_shaman_freedomwolf',
  },
  WINDFURY_ATTACK_BUFF: {
    id: 204608,
    name: 'Windfury Attack',
    icon: 'spell_shaman_unleashweapon_wind',
  },
  CRASHING_STORM_DAMAGE: {
    id: 210801,
    name: 'Crashing Storm',
    icon: 'spell_nature_unrelentingstorm',
  },
  HAILSTORM_BUFF: {
    id: 334196,
    name: 'Hailstorm',
    icon: 'spell_frost_icestorm',
  },
  LASHING_FLAMES_DEBUFF: {
    id: 334168,
    name: 'Lashing Flames',
    icon: 'spell_shaman_improvelavalash',
  },
  FORCEFUL_WINDS_BUFF: {
    id: 262652,
    name: 'Forceful Winds Buff',
    icon: 'spell_shaman_unleashweapon_wind',
  },
  HOT_HAND_BUFF: {
    id: 215785,
    name: 'Hot Hand',
    icon: 'spell_fire_playingwithfire',
  },
  STORMBRINGER: {
    id: 201845,
    name: 'Stormbringer',
    icon: 'spell_nature_stormreach',
  },
  LEGACY_OF_THE_FROST_WITCH_BUFF: {
    id: 384451,
    name: 'Legacy of the Frost Witch',
    icon: 'ability_thunderking_thunderstruck',
  },
  EARTHEN_MIGHT_TIER_BUFF: {
    id: 409689,
    name: 'Earthen Might',
    icon: 'inv_helmet_mail_raidshaman_j_01',
  },
  CRACKLING_THUNDER_TIER_BUFF: {
    id: 409834,
    name: 'Crackling Thunder',
    icon: 'ability_vehicle_electrocharge',
  },
  VOLCANIC_STRENGTH_TIER_BUFF: {
    id: 409833,
    name: 'Volcanic Strength',
    icon: 'ability_rhyolith_volcano',
  },
  MANA_SPRING_ENHANCEMENT: {
    id: 404550,
    name: 'Mana Spring',
    icon: 'spell_nature_manaregentotem',
  },
  ASHEN_CATALYST_BUFF: {
    id: 390371,
    name: 'Ashen Catalyst',
    icon: 'spell_shaman_stormearthfire',
  },
  STORMBLAST_DAMAGE: {
    id: 390287,
    name: 'Stormblast',
    icon: 'spell_shaman_focusedstrikes',
  },
  TEMPEST_STRIKES_DAMAGE: {
    id: 428078,
    name: 'Tempest Strikes',
    icon: 'spell_nature_thunderclap',
  },
  // Restoration Shaman
  HEALING_SURGE: {
    id: 8004,
    name: 'Healing Surge',
    icon: 'spell_nature_healingway',
    manaCost: 110000, // enh/ele cost is higher
  },
  TIDAL_WAVES_BUFF: {
    id: 53390,
    name: 'Tidal Waves',
    icon: 'spell_shaman_tidalwaves',
  },
  HEALING_RAIN_HEAL: {
    id: 73921,
    name: 'Healing Rain',
    icon: 'spell_nature_giftofthewaterspirit',
  },
  HEALING_STREAM_TOTEM: {
    id: 5394,
    name: 'Healing Stream Totem',
    icon: 'inv_spear_04',
  },
  HEALING_STREAM_TOTEM_HEAL: {
    id: 52042,
    name: 'Healing Stream Totem',
    icon: 'inv_spear_04',
  },
  HEALING_TIDE_TOTEM_HEAL: {
    id: 114942,
    name: 'Healing Tide Totem',
    icon: 'ability_shaman_healingtide',
  },
  ASCENDANCE_HEAL: {
    id: 114083,
    name: 'Ascendance',
    icon: 'spell_fire_elementaldevastation',
  },
  ASCENDANCE_INITIAL_HEAL: {
    id: 294020,
    name: 'Ascendance',
    icon: 'spell_fire_elementaldevastation',
  },
  SPIRIT_LINK_TOTEM_REDISTRIBUTE: {
    id: 98021,
    name: 'Spirit Link Totem',
    icon: 'spell_shaman_spiritlink',
  },
  SPIRIT_LINK_TOTEM_BUFF: {
    // casted by totem
    id: 325174,
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
  WELLSPRING_HEAL: {
    id: 197997,
    name: 'Wellspring',
    icon: 'ability_shawaterelemental_split',
  },
  WELLSPRING_UNLEASH_LIFE: {
    id: 383404,
    name: 'Unleash Life - Wellspring',
    icon: 'ability_shawaterelemental_split',
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
  },
  NATURES_SWIFTNESS_BUFF: {
    id: 378081,
    name: "Nature's Swiftness",
    icon: 'spell_nature_ravenform',
  },
  SPIRITWALKERS_TIDAL_TOTEM_BUFF: {
    id: 404523,
    name: "Spiritwalker's Tidal Totem",
    icon: 'spell_nature_regeneration_02',
  },
  MANA_TIDE_TOTEM_BUFF: {
    id: 320763,
    name: 'Mana Tide Totem',
    icon: 'spell_frost_summonwaterelemental',
  },
  WATER_SHIELD_ENERGIZE: {
    id: 52128,
    name: 'Water Shield',
    icon: 'ability_shaman_watershield',
  },
  SURGE_OF_EARTH_HEAL: {
    id: 320747,
    name: 'Surge of Earth',
    icon: 'inv_elementalearth2',
  },
  UNDERCURRENT_BUFF: {
    id: 383235,
    name: 'Undercurrent',
    icon: 'spell_fire_bluehellfire',
  },
  ANCESTRAL_GUIDANCE_HEAL: {
    id: 114911,
    name: 'Ancestral Guidance',
    icon: 'ability_shaman_ancestralguidance',
  },
  ANCESTRAL_AWAKENING_HEAL: {
    id: 382311,
    name: 'Ancestral Awakening',
    icon: 'spell_shaman_ancestralawakening',
  },
  OVERFLOWING_SHORES_HEAL: {
    id: 383223,
    name: 'Overflowing Shores',
    icon: 'spell_nature_giftofthewaterspirit',
  },
  EARTHLIVING_WEAPON_HEAL: {
    id: 382024,
    name: 'Earthliving Weapon',
    icon: 'spell_shaman_giftearthmother',
  },
  PRIMORDIAL_WAVE: {
    id: 375982,
    name: 'Primordial Wave',
    icon: 'ability_maldraxxus_shaman',
  },
  PRIMORDIAL_WAVE_DAMAGE: {
    id: 375984,
    name: 'Primordial Wave',
    icon: 'ability_maldraxxus_shaman',
  },
  PRIMORDIAL_WAVE_BUFF: {
    id: 375986,
    name: 'Primordial Wave',
    icon: 'ability_maldraxxus_shaman',
  },
  PRIMORDIAL_WAVE_HEAL: {
    id: 375985,
    name: 'Primordial Wave',
    icon: 'ability_maldraxxus_shaman',
  },
  SPLINTERED_ELEMENTS_BUFF: {
    id: 382043,
    name: 'Splintered Elements',
    icon: 'spell_nature_elementalprecision_1',
  },
  MANA_SPRING_RESTORATION: {
    id: 404551,
    name: 'Mana Spring',
    icon: 'spell_nature_manaregentotem',
  },
  STONE_BULWARK_CAST_BUFF: {
    id: 114893,
    name: 'Stone Bulwark',
    icon: 'ability_shaman_stonebulwark',
  },
  STONE_BULWARK_PULSE_BUFF: {
    id: 462844,
    name: 'Stone Bulwark',
    icon: 'ability_shaman_stonebulwark',
  },
  DOWNPOUR_ABILITY: {
    id: 462603,
    name: 'Downpour',
    icon: 'ability_mage_waterjet',
  },
  DOWNPOUR_HEAL: {
    id: 207778,
    name: 'Downpour',
    icon: 'ability_mage_waterjet',
  },
  HEALING_RAIN_TOTEMIC: {
    id: 456366,
    name: 'Healing Rain',
    icon: 'spell_nature_giftofthewaterspirit',
  },
  SURGING_TOTEM: {
    id: 444995,
    name: 'Surging Totem',
    icon: 'inv_ability_totemicshaman_surgingtotem',
  },
  WHIRLING_AIR: {
    id: 453409,
    name: 'Whirling Air',
    icon: 'inv_10_elementalcombinedfoozles_air',
  },
  WHIRLING_EARTH: {
    id: 453406,
    name: 'Whirling Earth',
    icon: 'inv_10_elementalcombinedfoozles_earth',
  },
  WHIRLING_WATER: {
    id: 453407,
    name: 'Whirling Water',
    icon: 'inv_10_elementalcombinedfoozles_water',
  },
  TIDEWATERS_HEAL: {
    id: 462425,
    name: 'Tidewaters',
    icon: 'ability_shawaterelemental_split',
  },
} satisfies Record<string, Spell>;

export default spells;
