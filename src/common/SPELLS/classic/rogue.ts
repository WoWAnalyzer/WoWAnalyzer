/**
 * All Classic Rogue spells (including talent spells) go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from '../Spell';

const spells = {
  // --------
  // SHARED
  // --------
  AMBUSH: {
    id: 8676,
    name: 'Ambush',
    icon: 'ability_rogue_ambush.jpg',
  },
  BACKSTAB: {
    id: 53,
    name: 'Backstab',
    icon: 'ability_backstab.jpg',
  },
  BLIND: {
    id: 2094,
    name: 'Blind',
    icon: 'spell_shadow_mindsteal.jpg',
  },
  CHEAP_SHOT: {
    id: 1833,
    name: 'Cheap Shot',
    icon: 'ability_cheapshot.jpg',
  },
  CLOAK_OF_SHADOWS: {
    id: 31224,
    name: 'Cloak of Shadows',
    icon: 'spell_shadow_nethercloak.jpg',
  },
  COMBAT_READINESS: {
    id: 74001,
    name: 'Combat Readiness',
    icon: 'ability_rogue_combatreadiness.jpg',
  },
  DEADLY_THROW: {
    id: 26679,
    name: 'Deadly Throw',
    icon: 'inv_throwingknife_06.jpg',
  },
  DISMANTLE: {
    id: 51722,
    name: 'Dismantle',
    icon: 'ability_rogue_dismantle.jpg',
  },
  ENVENOM: {
    id: 32645,
    name: 'Envenom',
    icon: 'ability_rogue_disembowel.jpg',
  },
  EVASION: {
    id: 5277,
    name: 'Evasion',
    icon: 'spell_shadow_shadowward.jpg',
  },
  EVISCERATE: {
    id: 2098,
    name: 'Eviscerate',
    icon: 'ability_rogue_eviscerate.jpg',
  },
  EXPOSE_ARMOR: {
    id: 8647,
    name: 'Expose Armor',
    icon: 'ability_warrior_riposte.jpg',
  },
  FAN_OF_KNIVES: {
    id: 51723,
    name: 'Fan of Knives',
    icon: 'ability_rogue_fanofknives.jpg',
  },
  FEINT: {
    id: 1966,
    name: 'Feint',
    icon: 'ability_rogue_feint.jpg',
  },
  GARROTE: {
    id: 703,
    name: 'Garrote',
    icon: 'ability_rogue_garrote.jpg',
  },
  GOUGE: {
    id: 1776,
    name: 'Gouge',
    icon: 'ability_gouge.jpg',
  },
  KICK: {
    id: 1766,
    name: 'Kick',
    icon: 'ability_kick.jpg',
  },
  KIDNEY_SHOT: {
    id: 408,
    name: 'Kidney Shot',
    icon: 'ability_rogue_kidneyshot.jpg',
  },
  RECUPERATE: {
    id: 73651,
    name: 'Recuperate',
    icon: 'ability_rogue_recuperate.jpg',
  },
  REDIRECT: {
    id: 73981,
    name: 'Redirect',
    icon: 'ability_rogue_redirect.jpg',
  },
  RUPTURE: {
    id: 1943,
    name: 'Rupture',
    icon: 'ability_rogue_rupture.jpg',
  },
  SHIV: {
    id: 5938,
    name: 'Shiv',
    icon: 'inv_throwingknife_04.jpg',
  },
  SINISTER_STRIKE: {
    id: 1752,
    name: 'Sinister Strike',
    icon: 'spell_shadow_ritualofsacrifice.jpg',
  },
  SLICE_AND_DICE: {
    id: 5171,
    name: 'Slice and Dice',
    icon: 'ability_rogue_slicedice.jpg',
  },
  SMOKE_BOMB: {
    id: 76577,
    name: 'Smoke Bomb',
    icon: 'ability_rogue_smoke.jpg',
  },
  SPRINT: {
    id: 2983,
    name: 'Sprint',
    icon: 'ability_rogue_sprint.jpg',
  },
  TRICKS_OF_THE_TRADE: {
    id: 57934,
    name: 'Tricks of the Trade',
    icon: 'ability_rogue_tricksofthetrade.jpg',
  },
  VANISH: {
    id: 1856,
    name: 'Vanish',
    icon: 'ability_vanish.jpg',
  },
  // ---------
  // TALENTS
  // ---------
  // Assassination
  COLD_BLOOD: {
    id: 14177,
    name: 'Cold Blood',
    icon: 'spell_ice_lament.jpg',
  },
  MUTILATE: {
    id: 1329,
    name: 'Mutilate',
    icon: 'ability_rogue_shadowstrikes.jpg',
  },
  VENDETTA: {
    id: 79140,
    name: 'Vendetta',
    icon: 'ability_rogue_deadliness.jpg',
  },
  // Combat
  ADRENALINE_RUSH: {
    id: 13750,
    name: 'Adrenaline Rush',
    icon: 'spell_shadow_shadowworddominate.jpg',
  },
  BLADE_FLURRY: {
    id: 13877,
    name: 'Blade Flurry',
    icon: 'ability_warrior_punishingblow.jpg',
  },
  KILLING_SPREE: {
    id: 51690,
    name: 'Killing Spree',
    icon: 'ability_rogue_murderspree.jpg',
  },
  OVERKILL_BUFF: {
    id: 58427,
    name: 'Overkill',
    icon: 'ability_hunter_rapidkilling.jpg',
  },
  REVEALING_STRIKE: {
    id: 84617,
    name: 'Revealing Strike',
    icon: 'inv_sword_97.jpg',
  },
  RIPOSTE: {
    id: 14251,
    name: 'Riposte',
    icon: 'ability_warrior_challange.jpg',
  },
  SAVAGE_COMBAT: {
    id: 58683,
    name: 'Savage Combat',
    icon: 'ability_creature_disease_03.jpg',
  },
  // Subtlety
  HEMORRHAGE: {
    id: 16511,
    name: 'Hemorrhage',
    icon: 'spell_shadow_lifedrain.jpg',
  },
  PREMEDITATION: {
    id: 14183,
    name: 'Premeditation',
    icon: 'spell_shadow_possession.jpg',
  },
  PREPARATION: {
    id: 14185,
    name: 'Preparation',
    icon: 'ability_rogue_preparation.jpg',
  },
  SHADOW_DANCE: {
    id: 51713,
    name: 'Shadow Dance',
    icon: 'ability_rogue_shadowdance.jpg',
  },
  SHADOWSTEP: {
    id: 36554,
    name: 'Shadowstep',
    icon: 'ability_rogue_shadowstep.jpg',
  },
  // ---------
  // OTHER
  // ---------
  RESTORE_ENERGY: {
    // Thistle Tea
    id: 9512,
    name: 'Restore Energy',
    icon: 'inv_drink_milk_05.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
