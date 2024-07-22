/**
 * All Classic Shaman spells (including talent spells) go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from '../Spell';

const spells = {
  // --------
  // SHARED
  // --------
  ANCESTRAL_SPIRIT: {
    id: 2008,
    name: 'Ancestral Spirit',
    icon: 'spell_nature_regenerate.jpg',
  },
  ASTRAL_RECALL: {
    id: 556,
    name: 'Astral Recall',
    icon: 'spell_nature_astralrecal.jpg',
  },
  BIND_ELEMENTAL: {
    id: 76780,
    name: 'Bind Elemental',
    icon: 'spell_shaman_bindelemental.jpg',
  },
  BLOODLUST: {
    id: 2825,
    name: 'Bloodlust',
    icon: 'spell_nature_bloodlust.jpg',
  },
  CALL_OF_THE_ANCESTORS: {
    id: 66843,
    name: 'Call of the Ancestors',
    icon: 'spell_shaman_dropall_02.jpg',
  },
  CALL_OF_THE_ELEMENTS: {
    id: 66842,
    name: 'Call of the Elements',
    icon: 'spell_shaman_dropall_01.jpg',
  },
  CALL_OF_THE_SPIRITS: {
    id: 66844,
    name: 'Call of the Spirits',
    icon: 'spell_shaman_dropall_01.jpg',
  },
  CHAIN_HEAL: {
    id: 1064,
    name: 'Chain Heal',
    icon: 'spell_nature_healingwavegreater.jpg',
  },
  CHAIN_LIGHTNING: {
    id: 421,
    name: 'Chain Lightning',
    icon: 'spell_nature_chainlightning.jpg',
  },
  CLEANSE_SPIRIT: {
    id: 51886,
    name: 'Cleanse Spirit',
    icon: 'ability_shaman_cleansespirit.jpg',
  },
  CLEANSING_WATERS_RANK1: {
    id: 86961,
    name: 'Cleansing Waters',
    icon: 'ability_shaman_cleansespirit.jpg',
  },
  CLEANSING_WATERS_RANK2: {
    id: 86958,
    name: 'Cleansing Waters',
    icon: 'ability_shaman_cleansespirit.jpg',
  },
  EARTH_ELEMENTAL_TOTEM: {
    id: 2062,
    name: 'Earth Elemental Totem',
    icon: 'spell_nature_earthelemental_totem.jpg',
  },
  EARTH_SHOCK: {
    id: 8042,
    name: 'Earth Shock',
    icon: 'spell_nature_earthshock.jpg',
  },
  EARTHBIND_TOTEM: {
    id: 2484,
    name: 'Earthbind Totem',
    icon: 'spell_nature_strengthofearthtotem02.jpg',
  },
  EARTHLIVING_WEAPON: {
    id: 51730,
    name: 'Earthliving Weapon',
    icon: 'spell_shaman_unleashweapon_life.jpg',
  },
  ELEMENTAL_RESISTANCE_TOTEM: {
    id: 8184,
    name: 'Elemental Resistance Totem',
    icon: 'spell_fireresistancetotem_01.jpg',
  },
  FIRE_ELEMENTAL_TOTEM: {
    id: 2894,
    name: 'Fire Elemental Totem',
    icon: 'spell_fire_elemental_totem.jpg',
  },
  FIRE_NOVA: {
    id: 1535,
    name: 'Fire Nova',
    icon: 'spell_shaman_firenova.jpg',
  },
  FLAME_SHOCK: {
    id: 8050,
    name: 'Flame Shock',
    icon: 'spell_fire_flameshock.jpg',
  },
  FLAMETONGUE_TOTEM: {
    id: 8227,
    name: 'Flametongue Totem',
    icon: 'spell_nature_guardianward.jpg',
  },
  FLAMETONGUE_WEAPON: {
    id: 8024,
    name: 'Flametongue Weapon',
    icon: 'spell_shaman_unleashweapon_flame.jpg',
  },
  FROST_SHOCK: {
    id: 8056,
    name: 'Frost Shock',
    icon: 'spell_frost_frostshock.jpg',
  },
  FROSTBRAND_WEAPON: {
    id: 8033,
    name: 'Frostbrand Weapon',
    icon: 'spell_shaman_unleashweapon_frost.jpg',
  },
  GHOST_WOLF: {
    id: 2645,
    name: 'Ghost Wolf',
    icon: 'spell_nature_spiritwolf.jpg',
  },
  GREATER_HEALING_WAVE: {
    id: 77472,
    name: 'Greater Healing Wave',
    icon: 'spell_nature_healingwavelesser.jpg',
  },
  GROUNDING_TOTEM: {
    id: 8177,
    name: 'Grounding Totem',
    icon: 'spell_nature_groundingtotem.jpg',
  },
  HEALING_RAIN: {
    id: 73920,
    name: 'Healing Rain',
    icon: 'spell_nature_giftofthewaterspirit.jpg',
  },
  HEALING_STREAM_TOTEM: {
    id: 5394,
    name: 'Healing Stream Totem',
    icon: 'inv_spear_04.jpg',
  },
  HEALING_SURGE: {
    id: 8004,
    name: 'Healing Surge',
    icon: 'classic_spell_nature_healingway.jpg',
  },
  HEALING_WAVE: {
    id: 331,
    name: 'Healing Wave',
    icon: 'spell_nature_magicimmunity.jpg',
  },
  HEROISM: {
    id: 32182,
    name: 'Heroism',
    icon: 'ability_shaman_heroism.jpg',
  },
  HEX: {
    id: 51514,
    name: 'Hex',
    icon: 'spell_shaman_hex.jpg',
  },
  LAVA_BURST: {
    id: 51505,
    name: 'Lava Burst',
    icon: 'spell_shaman_lavaburst.jpg',
  },
  LIGHTNING_BOLT: {
    id: 403,
    name: 'Lightning Bolt',
    icon: 'spell_nature_lightning.jpg',
  },
  LIGHTNING_SHIELD: {
    id: 26364,
    name: 'Lightning Shield',
    icon: 'spell_nature_lightningshield.jpg',
  },
  MAGMA_TOTEM: {
    id: 8190,
    name: 'Magma Totem',
    icon: 'spell_fire_selfdestruct.jpg',
  },
  MANA_SPRING_TOTEM: {
    id: 5675,
    name: 'Mana Spring Totem',
    icon: 'spell_nature_manaregentotem.jpg',
  },
  PRIMAL_STRIKE: {
    id: 73899,
    name: 'Primal Strike',
    icon: 'spell_shaman_primalstrike.jpg',
  },
  PURGE: {
    id: 370,
    name: 'Purge',
    icon: 'spell_nature_purge.jpg',
  },
  REINCARNATION: {
    id: 20608,
    name: 'Reincarnation',
    icon: 'spell_shaman_improvedreincarnation.jpg',
  },
  ROCKBITER_WEAPON: {
    id: 8017,
    name: 'Rockbiter Weapon',
    icon: 'spell_shaman_unleashweapon_earth.jpg',
  },
  SEARING_TOTEM: {
    id: 3599,
    name: 'Searing Totem',
    icon: 'spell_fire_searingtotem.jpg',
  },
  SPIRITWALKERS_GRACE: {
    id: 79206,
    name: "Spiritwalker's Grace",
    icon: 'spell_fire_searingtotem.jpg',
  },
  STONECLAW_TOTEM: {
    id: 5730,
    name: 'Stoneclaw Totem',
    icon: 'spell_nature_stoneclawtotem.jpg',
  },
  STONESKIN_TOTEM: {
    id: 8071,
    name: 'Stoneskin Totem',
    icon: 'spell_nature_stoneskintotem.jpg',
  },
  STRENGTH_OF_EARTH_TOTEM: {
    id: 8075,
    name: 'Strength of Earth Totem',
    icon: 'spell_nature_earthbindtotem.jpg',
  },
  TOTEM_OF_TRANQUIL_MIND: {
    id: 87718,
    name: 'Totem of Tranquil Mind',
    icon: 'spell_nature_brilliance.jpg',
  },
  TOTEMIC_RECALL: {
    id: 36936,
    name: 'Totemic Recall',
    icon: 'spell_shaman_totemrecall.jpg',
  },
  TREMOR_TOTEM: {
    id: 8143,
    name: 'Tremor Totem',
    icon: 'spell_nature_tremortotem.jpg',
  },
  UNLEASH_ELEMENTS: {
    id: 73680,
    name: 'Unleash Elements',
    icon: 'spell_shaman_improvedstormstrike.jpg',
  },
  UNLEASH_FLAME_BUFF: {
    id: 73683,
    name: 'Unleash Flame',
    icon: 'spell_shaman_unleashweapon_flame.jpg',
  },
  UNLEASH_FROST_BUFF: {
    id: 73682,
    name: 'Unleash Frost',
    icon: 'spell_shaman_unleashweapon_frost.jpg',
  },
  UNLEASH_WIND_BUFF: {
    id: 73681,
    name: 'Unleash Wind',
    icon: 'spell_shaman_unleashweapon_wind.jpg',
  },
  WATER_BREATHING: {
    id: 131,
    name: 'Water Breathing',
    icon: 'spell_shadow_demonbreath.jpg',
  },
  WATER_SHIELD: {
    id: 52127,
    name: 'Water Shield',
    icon: 'ability_shaman_watershield.jpg',
  },
  WATER_WALKING: {
    id: 546,
    name: 'Water Walking',
    icon: 'spell_frost_windwalkon.jpg',
  },
  WIND_SHEAR: {
    id: 57994,
    name: 'Wind Shear',
    icon: 'spell_nature_cyclone.jpg',
  },
  WINDFURY_TOTEM: {
    id: 8512,
    name: 'Windfury Totem',
    icon: 'spell_nature_windfury.jpg',
  },
  WINDFURY_WEAPON: {
    id: 8232,
    name: 'Windfury Weapon',
    icon: 'spell_shaman_unleashweapon_wind.jpg',
  },
  WRATH_OF_AIR_TOTEM: {
    id: 3738,
    name: 'Wrath of Air Totem',
    icon: 'spell_nature_slowingtotem.jpg',
  },

  // ---------
  // TALENTS
  // ---------

  // Elemental
  EARTHQUAKE: {
    id: 77478,
    name: 'Earthquake',
    icon: 'spell_shaman_earthquake.jpg',
  },
  ELEMENTAL_MASTERY: {
    id: 16166,
    name: 'Elemental Mastery',
    icon: 'spell_nature_wispheal.jpg',
  },
  ELEMENTAL_MASTERY_BUFF: {
    id: 64701,
    name: 'Elemental Mastery',
    icon: 'spell_nature_wispheal.jpg',
  },
  THUNDERSTORM: {
    id: 51490,
    name: 'Thunderstorm',
    icon: 'spell_shaman_thunderstorm.jpg',
  },
  // Enhancement
  FERAL_SPIRIT: {
    id: 51533,
    name: 'Feral Spirit',
    icon: 'spell_shaman_feralspirit.jpg',
  },
  FLURRY_BUFF: {
    id: 16282,
    name: 'Flurry',
    icon: 'ability_ghoulfrenzy.jpg',
  },
  LAVA_LASH: {
    id: 60103,
    name: 'Lava Lash',
    icon: 'ability_shaman_lavalash.jpg',
  },
  LAVA_SURGE: {
    id: 77762,
    name: 'Lava Surge!',
    icon: 'spell_shaman_lavasurge.jpg',
  },
  MAELSTROM_WEAPON_BUFF: {
    id: 53817,
    name: 'Maelstrom Weapon',
    icon: 'spell_shaman_maelstromweapon.jpg',
  },
  SHAMANISTIC_RAGE: {
    id: 30823,
    name: 'Shamanistic Rage',
    icon: 'spell_nature_shamanrage.jpg',
  },
  STORMSTRIKE: {
    id: 17364,
    name: 'Stormstrike',
    icon: 'ability_shaman_stormstrike.jpg',
  },
  UNLEASHED_RAGE: {
    id: 30808,
    name: 'Unleashed Rage',
    icon: 'spell_nature_unleashedrage.jpg',
  },
  // Restoration
  EARTH_SHIELD: {
    id: 974,
    name: 'Earth Shield',
    icon: 'spell_nature_skinofearth.jpg',
  },
  EARTH_SHIELD_HEAL: {
    id: 379,
    name: 'Earth Shield',
    icon: 'spell_nature_skinofearth.jpg',
  },
  MANA_TIDE_TOTEM: {
    id: 16190,
    name: 'Mana Tide Totem',
    icon: 'spell_frost_summonwaterelemental.jpg',
  },
  MANA_TIDE_TOTEM_BUFF: {
    id: 16191,
    name: 'Mana Tide',
    icon: 'spell_frost_summonwaterelemental.jpg',
  },
  NATURES_SWIFTNESS: {
    id: 16188,
    name: "Nature's Swiftness",
    icon: 'spell_nature_ravenform.jpg',
  },
  RIP_TIDE: {
    id: 61295,
    name: 'Riptide',
    icon: 'spell_nature_riptide.jpg',
  },
  SPIRIT_LINK_TOTEM: {
    id: 98008,
    name: 'Spirit Link Totem',
    icon: 'spell_shaman_spiritlink.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
