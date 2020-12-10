/**
 * All Shaman abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

const spells = {
  ASTRAL_SHIFT: {
    id: 108271,
    name: 'Astral Shift',
    icon: 'ability_shaman_astralshift',
  },
  PURIFY_SPIRIT: {
    id: 77130,
    name: 'Purify Spirit',
    icon: 'ability_shaman_cleansespirit',
    manaCost: 650,
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
    manaCost: 250,
  },
  RESONANCE_TOTEM_HASTE: {
    id: 262417,
    name: 'Resonance Totem',
    icon: 'spell_nature_stoneskintotem',
  },
  PURGE: {
    id: 370,
    name: 'Purge',
    icon: 'spell_nature_purge',
    manaCost: 800, // enh/ele cost is higher
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
    manaCost: 230,
  },
  SPIRIT_WOLF_BUFF: {
    id: 260881,
    name: 'Spirit Wolf',
    icon: 'spell_hunter_lonewolf',
  },
  EARTH_SHIELD: {
    id: 974,
    name: 'Earth Shield',
    icon: 'spell_nature_skinofearth',
    manaCost: 1000,
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
    manaCost: 1000,
  },
  EARTH_ELEMENTAL: {
    id: 198103,
    name: 'Earth Elemental',
    icon: 'spell_nature_earthelemental_totem',
  },
  CLEANSE_SPIRIT: {
    id: 51886,
    name: 'Cleanse Spirit',
    icon: 'ability_shaman_cleansespirit',
    manaCost: 650,
  },
  LIGHTNING_SHIELD: {
    id: 192106,
    name: 'Lightning Shield',
    icon: 'spell_nature_lightningshield',
    manaCost: 150,
  },
  FROST_SHOCK: {
    id: 196840,
    name: 'Frost Shock',
    icon: 'spell_frost_frostshock',
    manaCost: 100,
  },
  PRIMAL_STRIKE: {
    id: 73899,
    name: 'Primal Strike',
    icon: 'spell_shaman_primalstrike',
    manaCost: 940,
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
  RESONANCE_TOTEM_FULMINATION: {
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
    manaCost: 250,
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
    manaCost: 100,
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
    manaCost: 100,
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
  THUNDERSTORM: {
    icon: 'spell_shaman_thunderstorm',
    id: 51490,
    name: 'Thunderstorm',
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
  CRASH_LIGHTNING: {
    id: 187874,
    name: 'Crash Lightning',
    icon: 'spell_shaman_crashlightning',
    manaCost: 550,
  },
  FERAL_SPIRIT: {
    id: 51533,
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
  STORMSTRIKE_CAST: {
    id: 17364,
    name: 'Stormstrike',
    icon: 'ability_shaman_stormstrike',
    manaCost: 200,
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
  LAVA_LASH: {
    id: 60103,
    name: 'Lava Lash',
    icon: 'ability_shaman_lavalash',
    manaCost: 400,
  },
  FIRE_NOVA_DAMAGE: {
    id: 333977,
    name: 'Fire Nova',
    icon: 'spell_shaman_improvedfirenova',
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
    manaCost: 2150,
  },
  HEROISM: {
    id: 32182,
    name: 'Heroism',
    icon: 'ability_shaman_heroism',
    manaCost: 2150,
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
  WINDFURY_TOTEM: {
    id: 8512,
    name: 'Windfury Totem',
    icon: 'spell_nature_windfury',
    manaCost: 1200,
  },
  WINDFURY_TOTEM_BUFF: {
    id: 327942,
    name: 'Windfury Totem',
    icon: 'spell_nature_windfury',
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
    name: 'Hot Hand Buff',
    icon: 'spell_fire_playingwithfire',
  },
  // Restoration Shaman
  CHAIN_HEAL: {
    id: 1064,
    name: 'Chain Heal',
    icon: 'spell_nature_healingwavegreater',
    manaCost: 3000,
  },
  HEALING_WAVE: {
    id: 77472,
    name: 'Healing Wave',
    icon: 'spell_nature_healingwavelesser',
    manaCost: 1500,
  },
  HEALING_SURGE: {
    id: 8004,
    name: 'Healing Surge',
    icon: 'spell_nature_healingway',
    manaCost: 2400, // enh/ele cost is higher
  },
  RIPTIDE: {
    id: 61295,
    name: 'Riptide',
    icon: 'spell_nature_riptide',
    manaCost: 800,
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
    manaCost: 2160,
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
    manaCost: 900,
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
    manaCost: 560,
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
  SPIRIT_LINK_TOTEM: {
    id: 98008,
    name: 'Spirit Link Totem',
    icon: 'spell_shaman_spiritlink',
    manaCost: 1100,
  },
  SPIRIT_LINK_TOTEM_REDISTRIBUTE: {
    id: 98021,
    name: 'Spirit Link Totem',
    icon: 'spell_shaman_spiritlink',
  },
  SPIRIT_LINK_TOTEM_BUFF: { // casted by totem
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
  SPIRITWALKERS_GRACE: {
    id: 79206,
    name: 'Spiritwalker\'s Grace',
    icon: 'spell_shaman_spiritwalkersgrace',
    manaCost: 1410,
  },
  WELLSPRING_HEAL: {
    id: 197997,
    name: 'Wellspring',
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
  MANA_TIDE_TOTEM_CAST: {
    id: 16191,
    name: 'Mana Tide Totem',
    icon: 'spell_frost_summonwaterelemental',
  },
  MANA_TIDE_TOTEM_BUFF: {
    id: 320763,
    name: 'Mana Tide Totem',
    icon: 'spell_frost_summonwaterelemental',
  },
  WATER_SHIELD: {
    id: 52127,
    name: 'Water Shield',
    icon: 'ability_shaman_watershield',
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
} as const;

export default spells;
