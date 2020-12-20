const talents = {
  // Shared
  ECHO_OF_THE_ELEMENTS_TALENT: { id: 108283, name: 'Echo of the Elements', icon: 'ability_shaman_echooftheelements' },
  ELEMENTAL_BLAST_TALENT: { id: 117014, name: 'Elemental Blast', icon: 'shaman_talent_elementalblast', manaCost: 275 },
  SPIRIT_WOLF_TALENT: { id: 260878, name: 'Spirit Wolf', icon: 'spell_hunter_lonewolf' },
  STATIC_CHARGE_TALENT: { id: 265046, name: 'Static Charge', icon: 'spell_nature_brilliance' },
  NATURES_GUARDIAN_TALENT: { id: 30884, name: 'Nature\'s Guardian', icon: 'spell_nature_natureguardian' },
  WIND_RUSH_TOTEM_TALENT: { id: 192077, name: 'Wind Rush Totem', icon: 'ability_shaman_windwalktotem' },
  // Enhancement
  LASHING_FLAMES_TALENT: { id: 334046, name: 'Lashing Flames', icon: 'spell_shaman_improvelavalash' },
  FORCEFUL_WINDS_TALENT: { id: 262647, name: 'Forceful Winds', icon: 'spell_shaman_unleashweapon_wind' },
  STORMFLURRY_TALENT: { id: 344357, name: 'Stormflurry', icon: 'ability_shaman_stormstrike' },
  HOT_HAND_TALENT: { id: 201900, name: 'Hot Hand', icon: 'spell_fire_playingwithfire' },
  ICE_STRIKE_TALENT: { id: 342240, name: 'Ice Strike', icon: 'spell_frost_frostbolt', manaCost: 330 },
  ELEMENTAL_ASSAULT_TALENT: { id: 210853, name: 'Elemental Assault', icon: 'shaman_talent_unleashedfury' },
  HAILSTORM_TALENT: { id: 334195, name: 'Hailstorm', icon: 'spell_frost_icestorm' },
  FIRE_NOVA_TALENT: { id: 333974, name: 'Fire Nova', icon: 'spell_shaman_improvedfirenova', manaCost: 550 },
  FERAL_LUNGE_TALENT: { id: 196884, name: 'Feral Lunge', icon: 'spell_beastmaster_wolf' },
  CRASHING_STORM_TALENT: { id: 192246, name: 'Crashing Storm', icon: 'spell_nature_unrelentingstorm' },
  STORMKEEPER_TALENT_ENHANCEMENT: { id: 320137, name: 'Stormkeeper', icon: 'ability_thunderking_lightningwhip' },
  SUNDERING_TALENT: { id: 197214, name: 'Sundering', icon: 'ability_rhyolith_lavapool', manaCost: 600 },
  ELEMENTAL_SPIRITS_TALENT: { id: 262624, name: 'Elemental Spirits', icon: 'spell_shaman_feralspirit' },
  EARTHEN_SPIKE_TALENT: { id: 188089, name: 'Earthen Spike', icon: 'ability_earthen_pillar', manaCost: 375 },
  ASCENDANCE_TALENT_ENHANCEMENT: { id: 114051, name: 'Ascendance', icon: 'spell_fire_elementaldevastation' },

  // Elemental
  // 15
  EARTHEN_RAGE_TALENT: { id: 170374, name: 'Earthen Rage', icon: 'ability_earthen_pillar' },
  // Echo of the Elements is shared
  STATIC_DISCHARGE_TALENT: { id: 342243, name: 'Static Discharge', icon: 'spell_lightning_lightningbolt01'},
  // 25
  AFTERSHOCK_TALENT: { id: 273221, name: 'Aftershock', icon: 'spell_nature_stormreach' },
  ECHOING_SHOCK_TALENT: { id: 320125, name: 'Echoing Shock', icon: 'misc_legionfall_shaman' },
  // Elemental Blast is shared
  // 30
  // Spirit Wolf is shared
  // Earth Shield is shared
  // Static Charge is shared
  // 35
  MASTER_OF_THE_ELEMENTS_TALENT: { id: 16166, name: 'Master of the Elements', icon: 'spell_nature_elementalabsorption' },
  STORM_ELEMENTAL_TALENT: { id: 192249, name: 'Storm Elemental', icon: 'inv_stormelemental' },
  LIQUID_MAGMA_TOTEM_TALENT: { id: 192222, name: 'Liquid Magma Totem', icon: 'spell_shaman_spewlava' },
  // 40
  // Nature's Guardian is shared
  ANCESTRAL_GUIDANCE_TALENT: { id: 108281, name: 'Ancestral Guidance', icon: 'ability_shaman_ancestralguidance' },
  // Wind Rush Totem is shared
  // 45
  SURGE_OF_POWER_TALENT: { id: 262303, name: 'Surge of Power', icon: 'spell_nature_shamanrage' },
  PRIMAL_ELEMENTALIST_TALENT: { id: 117013, name: 'Primal Elementalist', icon: 'shaman_talent_primalelementalist' },
  ICEFURY_TALENT: { id: 210714, name: 'Icefury', icon: 'spell_frost_iceshard' },
  // 50
  UNLIMITED_POWER_TALENT: { id: 260895, name: 'Unlimited Power', icon: 'ability_shaman_ascendance' },
  STORMKEEPER_TALENT: { id: 191634, name: 'Stormkeeper', icon: 'ability_thunderking_lightningwhip' },
  ASCENDANCE_TALENT_ELEMENTAL: { id: 114050, name: 'Ascendance', icon: 'spell_fire_elementaldevastation' },

  // Restoration
  TORRENT_TALENT: {
    id: 200072,
    name: 'Torrent',
    icon: 'spell_nature_riptide'
  },
  UNDULATION_TALENT: {
    id: 200071,
    name: 'Undulation',
    icon: 'spell_nature_healingwavelesser'
  },
  UNLEASH_LIFE_TALENT: {
    id: 73685,
    name: 'Unleash Life',
    icon: 'spell_shaman_unleashweapon_life',
    manaCost: 400
  },
  DELUGE_TALENT: {
    id: 200076,
    name: 'Deluge',
    icon: 'ability_shawaterelemental_reform'
  },
  SURGE_OF_EARTH_TALENT: {
    id: 320746,
    name: 'Surge of Earth',
    icon: 'inv_elementalearth2',
    manaCost: 1000
  },
  EARTHGRAB_TOTEM_TALENT: {
    id: 51485,
    name: 'Earthgrab Totem',
    icon: 'spell_nature_stranglevines',
    manaCost: 250
  },
  ANCESTRAL_VIGOR_TALENT: {
    id: 207401,
    name: 'Ancestral Vigor',
    icon: 'spell_shaman_blessingoftheeternals'
  },
  EARTHEN_WALL_TOTEM_TALENT: {
    id: 198838,
    name: 'Earthen Wall Totem',
    icon: 'spell_nature_stoneskintotem',
    manaCost: 1100
  },
  ANCESTRAL_PROTECTION_TOTEM_TALENT: {
    id: 207399,
    name: 'Ancestral Protection Totem',
    icon: 'spell_nature_reincarnation',
    manaCost: 1100
  },
  GRACEFUL_SPIRIT_TALENT: {
    id: 192088,
    name: 'Graceful Spirit',
    icon: 'spell_shaman_spectraltransformation'
  },
  FLASH_FLOOD_TALENT: {
    id: 280614,
    name: 'Flash Flood',
    icon: 'spell_frost_summonwaterelemental'
  },
  DOWNPOUR_TALENT: {
    id: 207778,
    name: 'Downpour',
    icon: 'ability_mage_waterjet',
    manaCost: 1500
  },
  CLOUDBURST_TOTEM_TALENT: {
    id: 157153,
    name: 'Cloudburst Totem',
    icon: 'ability_shaman_condensationtotem',
    manaCost: 860
  },
  HIGH_TIDE_TALENT: {
    id: 157154,
    name: 'High Tide',
    icon: 'spell_shaman_hightide'
  },
  WELLSPRING_TALENT: {
    id: 197995,
    name: 'Wellspring',
    icon: 'ability_shawaterelemental_split',
    manaCost: 2000
  },
  ASCENDANCE_TALENT_RESTORATION: {
    id: 114052,
    name: 'Ascendance',
    icon: 'spell_fire_elementaldevastation'
  },
} as const;
export default talents;