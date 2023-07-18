import Spell from '../Spell';

const spells = {
  UNSTABLE_FLAMES: {
    id: 401394,
    name: 'Unstables Flames',
    icon: 'spell_fire_felflamering_red',
  },
  SPOILS_OF_NELTHARUS_HASTE: {
    id: 381955,
    name: 'Spoils of Neltharus',
    icon: 'inv_gizmo_electrifiedether',
  },
  SPOILS_OF_NELTHARUS_CRIT: {
    id: 381954,
    name: 'Spoils of Neltharus',
    icon: 'inv_chaos_orb',
  },
  SPOILS_OF_NELTHARUS_VERSATILITY: {
    id: 381957,
    name: 'Spoils of Neltharus',
    icon: 'inv_rod_enchantedcobalt',
  },
  SPOILS_OF_NELTHARUS_MASTERY: {
    id: 381956,
    name: 'Spoils of Neltharus',
    icon: 'ability_mount_goatmount',
  },
} satisfies Record<string, Spell>;

export default spells;
