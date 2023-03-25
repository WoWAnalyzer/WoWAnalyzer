/**
 * All WotLK Rogue spells (including talent spells) go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import { spellIndexableList } from '../Spell';

const spells = spellIndexableList({
  // --------
  // SHARED
  // --------
  AMBUSH: {
    id: 48691,
    name: 'Ambush',
    icon: 'ability_rogue_ambush',
    lowRanks: [48690, 48689, 27441, 11269, 11268, 11267, 8725, 8724, 8676],
  },
  BACKSTAB: {
    id: 48657,
    name: 'Backstab',
    icon: 'ability_backstab',
    lowRanks: [48656, 26863, 25300, 11281, 11280, 11279, 8721, 2591, 2590, 2589, 53],
  },
  BLIND: {
    id: 2094,
    name: 'Blind',
    icon: 'spell_shadow_mindsteal',
  },
  CHEAP_SHOT: {
    id: 1833,
    name: 'Cheap Shot',
    icon: 'ability_cheapshot',
  },
  CLOAK_OF_SHADOWS: {
    id: 31224,
    name: 'Cloak of Shadows',
    icon: 'spell_shadow_nethercloak',
  },
  DEADLY_THROW: {
    id: 48674,
    name: 'Deadly Throw',
    icon: 'inv_throwingknife_06',
    lowRanks: [48673, 26679],
  },
  DISMANTLE: {
    id: 51722,
    name: 'Dismantle',
    icon: 'ability_rogue_dismantle',
  },
  ENVENOM: {
    id: 57993,
    name: 'Envenom',
    icon: 'ability_rogue_disembowel',
    lowRanks: [57992, 32684, 32645],
  },
  EVASION: {
    id: 26669,
    name: 'Evasion',
    icon: 'spell_shadow_shadowward',
    lowRanks: [8],
  },
  EVISCERATE: {
    id: 48668,
    name: 'Eviscerate',
    icon: 'ability_rogue_eviscerate',
    lowRanks: [48667, 26865, 31016, 11300, 11299, 8624, 8623, 6762, 6761, 6760, 2098],
  },
  EXPOSE_ARMOR: {
    id: 8647,
    name: 'Expose Armor',
    icon: 'ability_warrior_riposte',
  },
  FAN_OF_KNIVES: {
    id: 51723,
    name: 'Fan of Knives',
    icon: 'ability_rogue_fanofknives',
  },
  FEINT: {
    id: 48659,
    name: 'Feint',
    icon: 'ability_rogue_feint',
    lowRanks: [48658, 27448, 25302, 11303, 8637, 6768, 1966],
  },
  GARROTE: {
    id: 48676,
    name: 'Garrote',
    icon: 'ability_rogue_garrote',
    lowRanks: [48675, 26884, 26839, 11290, 11289, 8633, 8632, 8631, 703],
  },
  GOUGE: {
    id: 1776,
    name: 'Gouge',
    icon: 'ability_gouge',
  },
  KICK: {
    id: 1766,
    name: 'Kick',
    icon: 'ability_kick',
  },
  KIDNEY_SHOT: {
    id: 8643,
    name: 'Kidney Shot',
    icon: 'ability_rogue_kidneyshot',
    lowRanks: [408],
  },
  RUPTURE: {
    id: 48672,
    name: 'Rupture',
    icon: 'ability_rogue_rupture',
    lowRanks: [48671, 26867, 11275, 11274, 11273, 8640, 8639, 1943],
  },
  SHIV: {
    id: 5938,
    name: 'Shiv',
    icon: 'inv_throwingknife_04',
  },
  SINISTER_STRIKE: {
    id: 48638,
    name: 'Sinister Strike',
    icon: 'spell_shadow_ritualofsacrifice',
    lowRanks: [48637, 26862, 26861, 11294, 11293, 8621, 1760, 1759, 1758, 1757, 1752],
  },
  SLICE_AND_DICE: {
    id: 6774,
    name: 'Slice and Dice',
    icon: 'ability_rogue_slicedice',
    lowRanks: [5171],
  },
  SPRINT: {
    id: 11305,
    name: 'Sprint',
    icon: 'ability_rogue_sprint',
    lowRanks: [8696, 2983],
  },
  TRICKS_OF_THE_TRADE: {
    id: 57934,
    name: 'Tricks of the Trade',
    icon: 'ability_rogue_tricksofthetrade',
  },
  VANISH: {
    id: 26889,
    name: 'Vanish',
    icon: 'ability_vanish',
    lowRanks: [1857, 1856],
  },
  // ---------
  // TALENTS
  // ---------
  // Assassination
  COLD_BLOOD: {
    id: 14177,
    name: 'Cold Blood',
    icon: 'spell_ice_lament',
  },
  HUNGER_FOR_BLOOD: {
    id: 51662,
    name: 'Hunger For Blood',
    icon: 'ability_rogue_hungerforblood',
  },
  MUTILATE: {
    id: 48666,
    name: 'Mutilate',
    icon: 'ability_rogue_shadowstrikes',
    lowRanks: [48663, 34413, 34412, 34411, 1329],
  },
  // Combat
  ADRENALINE_RUSH: {
    id: 13750,
    name: 'Adrenaline Rush',
    icon: 'spell_shadow_shadowworddominate',
  },
  BLADE_FLURRY: {
    id: 13877,
    name: 'Blade Flurry',
    icon: 'ability_warrior_punishingblow',
  },
  KILLING_SPREE: {
    id: 51690,
    name: 'Killing Spree',
    icon: 'ability_rogue_murderspree',
  },
  RIPOSTE: {
    id: 14251,
    name: 'Riposte',
    icon: 'ability_warrior_challange',
  },
  // Subtlety
  GHOSTLY_STRIKE: {
    id: 14278,
    name: 'Ghostly Strike',
    icon: 'spell_shadow_curse',
  },
  HEMORRHAGE: {
    id: 48660,
    name: 'Hemorrhage',
    icon: 'spell_shadow_lifedrain',
    lowRanks: [26864, 17348, 17347, 16511],
  },
  PREMEDITATION: {
    id: 14183,
    name: 'Premeditation',
    icon: 'spell_shadow_possession',
  },
  PREPARATION: {
    id: 14185,
    name: 'Preparation',
    icon: 'spell_shadow_antishadow',
  },
  SHADOW_DANCE: {
    id: 51713,
    name: 'Shadow Dance',
    icon: 'ability_rogue_shadowdance',
  },
  SHADOWSTEP: {
    id: 36554,
    name: 'Shadowstep',
    icon: 'ability_rogue_shadowstep',
  },
});

export default spells;
