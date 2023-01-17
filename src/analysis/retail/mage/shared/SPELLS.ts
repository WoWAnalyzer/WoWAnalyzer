/**
 * All Mage abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import { spellIndexableList } from 'common/SPELLS/Spell';

const spells = spellIndexableList({
  METEOR_DAMAGE: {
    id: 351140,
    name: 'Meteor',
    icon: 'spell_mage_meteor',
  },
  METEOR_BURN: {
    id: 155158,
    name: 'Meteor',
    icon: 'spell_mage_meteor',
  },
  CONE_OF_COLD: {
    id: 120,
    name: 'Cone of Cold',
    icon: 'spell_frost_glacier',
  },
  GREATER_INVISIBILITY_BUFF: {
    id: 110960,
    name: 'Greater Invisibility',
    icon: 'ability_mage_greaterinvisibility',
  },

  //General
  FROST_NOVA: {
    id: 122,
    name: 'Frost Nova',
    icon: 'spell_frost_frostnova',
  },
  BLINK: {
    id: 1953,
    name: 'Blink',
    icon: 'spell_arcane_blink',
  },
  COUNTERSPELL: {
    id: 2139,
    name: 'Counterspell',
    icon: 'spell_frost_iceshock',
  },
  SLOW_FALL: {
    id: 130,
    name: 'Slow Fall',
    icon: 'spell_magic_featherfall',
  },
  INVISIBILITY_BUFF: {
    id: 32612,
    name: 'Invisibility',
    icon: 'ability_mage_invisibility',
  },
  TIME_WARP: {
    id: 80353,
    name: 'Time Warp',
    icon: 'ability_mage_timewarp',
  },
  RUNE_OF_POWER_BUFF: {
    id: 116014,
    name: 'Rune of Power',
    icon: 'spell_mage_runeofpower',
  },
  RUNE_OF_POWER_AUTOCAST: {
    id: 342130,
    name: 'Rune of Power',
    icon: 'spell_mage_runeofpower',
  },
  MIRROR_IMAGE_SUMMON: {
    id: 88088,
    name: 'Mirror Image',
    icon: 'spell_magic_managain',
  },
  ARCANE_INTELLECT: {
    id: 1459,
    name: 'Arcane Intellect',
    icon: 'spell_holy_magicalsentry',
  },
  ALTER_TIME_RETURN: {
    id: 342247,
    name: 'Alter Time',
    icon: 'spell_mage_altertime',
  },
  ALTER_TIME_BUFF: {
    id: 342246,
    name: 'Alter Time',
    icon: 'spell_mage_altertime',
  },
  SHIFTING_POWER_TICK: {
    id: 382445,
    name: 'Shifting Power',
    icon: 'ability_ardenweald_mage',
  },
  POLYMORPH_SHEEP: {
    id: 118,
    name: 'Polymorph',
    icon: 'spell_nature_polymorph',
  },
  POLYMORPH_PIG: {
    id: 28272,
    name: 'Polymorph',
    icon: 'spell_magic_polymorphpig',
  },
  POLYMORPH_BLACK_CAT: {
    id: 61305,
    name: 'Polymorph',
    icon: 'achievement_halloween_cat_01',
  },
  POLYMORPH_MONKEY: {
    id: 161354,
    name: 'Polymorph',
    icon: 'ability_hunter_aspectofthemonkey',
  },
  POLYMORPH_RABBIT: {
    id: 61721,
    name: 'Polymorph',
    icon: 'spell_magic_polymorphrabbit',
  },
  POLYMORPH_POLAR_BEAR_CUB: {
    id: 161353,
    name: 'Polymorph',
    icon: 'inv_pet_babyblizzardbear',
  },
  POLYMORPH_PORCUPINE: {
    id: 126819,
    name: 'Polymorph',
    icon: 'inv_pet_porcupine',
  },
  POLYMORPH_TURTLE: {
    id: 28271,
    name: 'Polymorph',
    icon: 'ability_hunter_pet_turtle',
  },
  POLYMORPH_TURKEY: {
    id: 61780,
    name: 'Polymorph',
    icon: 'achievement_worldevent_thanksgiving',
  },
  POLYMORPH_PENGUIN: {
    id: 161355,
    name: 'Polymorph',
    icon: 'inv_misc_penguinpet',
  },
  POLYMORPH_BUMBLEBEE: {
    id: 277792,
    name: 'Polymorph',
    icon: 'inv_bee_default',
  },
  POLYMORPH_PEACOCK: {
    id: 161372,
    name: 'Polymorph',
    icon: 'inv_pet_peacock_gold',
  },
  POLYMORPH_DIREHORN: {
    id: 277787,
    name: 'Polymorph',
    icon: 'inv_pet_direhorn',
  },
  POLYMORPH_MAWRAT: {
    id: 321395,
    name: 'Polymorph',
    icon: 'inv_mawrat',
  },
  POLYMORPH_DUCK: {
    id: 391622,
    name: 'Polymorph',
    icon: 'inv_duckbaby_mallard',
  },
  DIVERTED_ENERGY_HEAL: {
    id: 382272,
    name: 'Diverted Energy',
    icon: 'inv_soulbarrier'
  },
  TEMPEST_BARRIER_ABSORB: {
    id: 382290,
    name: 'Tempest Barrier',
    icon: 'inv_shield_1h_artifactstormfist_d_04',
  },
});

export default spells;
