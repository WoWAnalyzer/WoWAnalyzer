import Spell from '../Spell';

const spells = {
  COBALT_FRAG_BOMB: {
    id: 67769,
    name: 'Cobalt Frag Bomb',
    icon: 'inv_misc_enggizmos_31',
  },
  FRAG_BELT: {
    id: 67890,
    name: 'Cobalt Frag Bomb',
    icon: 'inv_misc_enggizmos_31',
  },
  GLOBAL_THERMAL_SAPPER_CHARGE: {
    id: 56488,
    name: 'Global Thermal Sapper Charge',
    icon: 'inv_gizmo_supersappercharge',
  },
  GOBLIN_SAPPER_CHARGE: {
    id: 13241,
    name: 'Goblin Sapper Charge',
    icon: 'spell_fire_selfdestruct',
  },
  HYPERSPEED_ACCELERATION: {
    id: 54758,
    name: 'Hyperspeed Acceleration',
    icon: 'spell_shaman_elementaloath',
  },
  SARONITE_BOMB: {
    id: 56350,
    name: 'Saronite Bomb',
    icon: 'inv_misc_enggizmos_32',
  },
  SUPER_SAPPER_CHARGE: {
    id: 30486,
    name: 'Super Sapper Charge',
    icon: 'inv_gizmo_supersappercharge',
  },
  SYNAPSE_SPRINGS: { id: 82174, name: 'Synapse Springs', icon: 'spell_shaman_elementaloath.jpg' },
} satisfies Record<string, Spell>;

export default spells;
