import NPC from './NPC';

const npcs = {
  PRIMAL_FIRE_ELEMENTAL: {
    id: 61029,
    name: 'Primal Fire Elemental',
    type: 'Pet',
  },
  PRIMAL_STORM_ELEMENTAL: {
    id: 77942,
    name: 'Primal Storm Elemental',
    type: 'Pet',
  },
  GREATER_LIGHTNING_ELEMENTAL: {
    id: 97022,
    name: 'Greater Lightning Elemental',
    type: 'Pet',
  },
  LESSER_PRIMAL_STORM_ELEMENTAL: {
    id: 229798,
    name: 'Lesser Primal Storm Elemental',
    type: 'Pet',
  },
  FARSEER_ANCESTOR: {
    id: 221177,
    name: 'Ancestor',
    type: 'Pet',
  },
  SURGING_TOTEM: {
    id: 225409,
    name: 'Surging Totem',
    type: 'Pet',
  },
} satisfies Record<string, NPC>;

export default npcs;
