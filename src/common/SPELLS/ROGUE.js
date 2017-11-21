/**
 * All Rogue abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // Defensive general spells
  FEINT: {
    id: 1966,
    name: 'Feint',
    icon: 'ability_rogue_feint',
  },
  CRIMSON_VAIL: {
    id: 185311,
    name: 'Crimson Vial',
    icon: 'ability_rogue_crimsonvial',
  },
  CLOAK_OF_SHADOWS: {
    id: 31224,
    name: 'Cloak of Shadows',
    icon: 'spell_shadow_nethercloak',
  },
  EVASION: {
    id: 5277,
    name: 'Evasion',
    icon: 'spell_shadow_shadowward',
  },

  // General spells
  KICK: {
    id: 1766,
    name: 'Kick',
    icon: 'ability_kick',
  },
  SPRINT: {
    id: 2983,
    name: 'Sprint',
    icon: 'ability_rogue_sprint',
  },
  VANISH: {
    id: 1856,
    name: 'Vanish',
    icon: 'ability_vanish',
  },
  SHADOWSTEP: {
    id: 36554,
    name: 'Shadowstep',
    icon: 'ability_rogue_shadowstep',
  },
  SAP: {
    id: 6770,
    name: 'Sap',
    icon: 'ability_sap',
  },
  CHEAP_SHOT: {
    id: 1833,
    name: 'Cheap Shot',
    icon: 'ability_cheapshot',
  },
  KIDNEY_SHOT: {
    id: 408,
    name: 'Kidney Shot',
    icon: 'ability_rogue_kidneyshot',
  },
  ARCANE_TORRENT_ROGUE: {
    id: 25046,
    name: 'Arcane Torrent',
    icon: 'spell_shadow_teleport',
  },

  // Subtlety spells
  // Combo point generating damage ability
  BACKSTAB: {
    id: 53,
    name: 'Backstab',
    icon: 'ability_backstab',
  },
  SHADOWSTRIKE: {
    id: 185438,
    name: 'Shadowstrike',
    icon: 'ability_rogue_shadowstrike',
  },
  SHURIKEN_STORM: {
    id: 197835,
    name: 'Shuriken Storm',
    icon: 'ability_rogue_shurikenstorm',
  },
  SHURIKEN_TOSS: {
    id: 114014,
    name: 'Shuriken Toss',
    icon: 'inv_throwingknife_07',
  },
  // Main finishing move
  NIGHTBLADE: {
    id: 195452,
    name: 'Nightblade',
    icon: 'ability_rogue_nightblade',
  },
  EVISCERATE: {
    id: 196819,
    name: 'Eviscerate',
    icon: 'ability_rogue_eviscerate',
  },
  // Offensive cooldown
  SHADOW_BLADES: {
    id: 121471,
    name: 'Shadow Blades',
    icon: 'inv_knife_1h_grimbatolraid_d_03',
  },
  SHADOW_DANCE: {
    id: 185313,
    name: 'Shadow Dance',
    icon: 'ability_rogue_shadowdance',
  },
  SYMBOLS_OF_DEATH: {
    id: 212283,
    name: 'Symbols of Death',
    icon: 'spell_shadow_rune',
  },
  GOREMAWS_BITE: {
    id: 209782,
    name: 'Goremaw\'s Bite',
    icon: 'inv_knife_1h_artifactfangs_d_01',
  },
  // Triggered damage
  SHADOW_NOVA: {
    id: 197800,
    name: 'Shadow Nova',
    icon: 'spell_fire_twilightnova',
  },
  // CP Generation
  SHADOW_TECHNIQUES: {
    id: 196911,
    name: 'Shadow Techniques',
    icon: 'ability_rogue_masterofsubtlety',
  },
  SHURIKEN_STORM_CP: {
    id: 212743,
    name: 'Shuriken Storm',
    icon: 'ability_rogue_shurikenstorm',
  },
  // ENERGY REGEN
  GOREMAWS_BITE_ENERGY: {
    id: 220901,
    name: 'Goremaw\'s Bite',
    icon: 'inv_knife_1h_artifactfangs_d_01',
  },
  RELENTLESS_STRIKES: {
    id: 98440,
    name: 'Relentless Strikes',
    icon: 'ability_warrior_decisivestrike',
  },
  ENERGETIC_STABBING: {
    id: 197237,
    name: 'Energetic Stabbing',
    icon: 'inv_knife_1h_pvppandarias3_c_02',
  },
  // Buffs
  SHADOW_DANCE_BUFF: {
    id: 185422,
    name: 'Shadow Dance',
    icon: 'ability_rogue_shadowdance',
  },
};
