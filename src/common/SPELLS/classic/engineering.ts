import Spell from '../Spell';

const spells = {
  BIG_DADDY: {
    id: 89637,
    name: 'Big Daddy',
    icon: 'inv_misc_enggizmos_38.jpg',
  },
  FLEXWEAVE_UNDERLAY: {
    id: 55001, // Parachute
    name: 'Flexweave Underlay',
    icon: 'spell_magic_featherfall.jpg',
    enchantId: 3605,
  },
  GLOBAL_THERMAL_SAPPER_CHARGE: {
    id: 56488,
    name: 'Global Thermal Sapper Charge',
    icon: 'inv_gizmo_supersappercharge.jpg',
  },
  HYPERSPEED_ACCELERATION: {
    id: 54758,
    name: 'Hyperspeed Acceleration',
    icon: 'spell_shaman_elementaloath.jpg',
    enchantId: 3604,
  },
  NITRO_BOOSTS: {
    id: 54861,
    name: 'Nitro Boosts',
    icon: 'spell_fire_burningspeed.jpg',
    enchantId: 4223,
  },
  SARONITE_BOMB: {
    id: 56350,
    name: 'Saronite Bomb',
    icon: 'inv_misc_enggizmos_32.jpg',
  },
  SYNAPSE_SPRINGS: {
    id: 82174,
    name: 'Synapse Springs',
    icon: 'spell_shaman_elementaloath.jpg',
    enchantId: 4179,
  },
} satisfies Record<string, Spell>;

export default spells;
