/**
 * All Mage abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import { spellIndexableList } from 'common/SPELLS/Spell';

const spells = spellIndexableList({
  //Fire
  FIREBALL: {
    id: 133,
    name: 'Fireball',
    icon: 'spell_fire_flamebolt',
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
  PYROCLASM_BUFF: {
    id: 269651,
    name: 'Pyroclasm',
    icon: 'spell_shaman_lavasurge',
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
});

export default spells;
