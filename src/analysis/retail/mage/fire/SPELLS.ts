/**
 * All Mage abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from 'common/SPELLS/Spell';

const spells = {
  //Fire
  FIREBALL: {
    id: 133,
    name: 'Fireball',
    icon: 'spell_fire_flamebolt',
  },
  FLAMESTRIKE: {
    id: 2120,
    name: 'Flamestrike',
    icon: 'spell_fire_selfdestruct',
  },
  FIRE_BLAST: {
    id: 108853,
    name: 'Fire Blast',
    icon: 'spell_fire_fireball',
  },
  PHOENIX_FLAMES_DAMAGE: {
    id: 257542,
    name: 'Phoenix Flames',
    icon: 'artifactability_firemage_phoenixbolt',
  },
  HEATING_UP: {
    id: 48107,
    name: 'Heating Up',
    icon: 'ability_mage_hotstreak',
  },
  HOT_STREAK: {
    id: 48108,
    name: 'Hot Streak',
    icon: 'ability_mage_hotstreak',
  },
  PYROTECHNICS_BUFF: {
    id: 157644,
    name: 'Pyrotechnics',
    icon: 'spell_fire_flamebolt',
  },
  FRENETIC_SPEED: {
    id: 236060,
    name: 'Frenetic Speed',
    icon: 'spell_fire_burningspeed',
  },
  SCORCH: {
    id: 2948,
    name: 'Scorch',
    icon: 'spell_fire_soulburn',
  },
  FLAME_PATCH_DAMAGE: {
    id: 205472,
    name: 'Flame Patch',
    icon: 'spell_fire_selfdestruct',
  },
  IGNITE: {
    id: 12654,
    name: 'Ignite',
    icon: 'spell_fire_incinerate',
  },
  FEEL_THE_BURN_BUFF: {
    id: 383395,
    name: 'Feel the Burn',
    icon: 'spell_fire_fireball',
  },
  HYPERTHERMIA_BUFF: {
    id: 383874,
    name: 'Hyperthermia',
    icon: 'spell_fire_burnout',
  },
  FEVERED_INCANTATION_BUFF: {
    id: 383811,
    name: 'Fevered Incantation',
    icon: 'inv_misc_enchantedpearld',
  },
  FURY_OF_THE_SUN_KING: {
    id: 383883,
    name: 'Fury of the Sun King',
    icon: 'ability_rhyolith_immolation',
  },
  SUN_KINGS_BLESSING_BUFF_STACK: {
    id: 383882,
    name: "Sun King's Blessing",
    icon: 'ability_mage_firestarter',
  },
  IMPROVED_SCORCH_BUFF: {
    id: 383608,
    name: 'Improved Scorch',
    icon: 'ability_mage_fierypayback',
  },
  FLAME_ACCELERANT_BUFF: {
    id: 203277,
    name: 'Flame Accelerant',
    icon: 'inv_ember',
  },
  LIVING_BOMB_TICK_DAMAGE: {
    id: 217694,
    name: 'Living Bomb',
    icon: 'ability_mage_livingbomb',
  },
  LIVING_BOMB_EXPLODE_DAMAGE: {
    id: 44461,
    name: 'Living Bomb',
    icon: 'ability_mage_livingbomb',
  },
  LIVING_BOMB_EXPLODE_DEBUFF: {
    id: 244813,
    name: 'Living Bomb',
    icon: 'ability_mage_livingbomb',
  },
  LIVING_BOMB_EXCESS_FIRE_EXPLODE_DEBUFF: {
    id: 438672,
    name: 'Living Bomb',
    icon: 'ability_mage_livingbomb',
  },
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
  CAUTERIZED_DEBUFF: {
    id: 87024,
    name: 'Cauterized',
    icon: 'spell_fire_rune',
  },
} satisfies Record<string, Spell>;

export default spells;
