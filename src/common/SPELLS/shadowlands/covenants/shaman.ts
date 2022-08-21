import { spellIndexableList } from '../../Spell';

const covenants = spellIndexableList({
  //region Kyrian
  VESPER_TOTEM: {
    id: 324386,
    name: 'Vesper Totem',
    icon: 'ability_bastion_shaman',
  },
  //endregion

  //region Necrolord
  PRIMORDIAL_WAVE_CAST: {
    id: 326059,
    name: 'Primordial Wave',
    icon: 'ability_maldraxxus_shaman',
    manaCost: 300,
  },
  PRIMORDIAL_WAVE_BUFF: {
    id: 327164,
    name: 'Primordial Wave',
    icon: 'ability_maldraxxus_shaman',
  },
  PRIMORDIAL_WAVE_HEAL: {
    id: 327163,
    name: 'Primordial Wave',
    icon: 'ability_maldraxxus_shaman',
  },
  //endregion

  //region Night Fae
  FAE_TRANSFUSION: {
    id: 328923,
    name: 'Fae Transfusion',
    icon: 'ability_ardenweald_shaman',
    manaCost: 1000,
  },
  FAE_TRANSFUSION_BUFF: {
    id: 328933,
    name: 'Fae Transfusion',
    icon: 'ability_ardenweald_shaman',
  },
  FAE_TRANSFUSION_HEAL: {
    id: 328930,
    name: 'Fae Transfusion',
    icon: 'ability_ardenweald_shaman',
  },
  //endregion

  //region Venthyr
  CHAIN_HARVEST: {
    id: 320674,
    name: 'Chain Harvest',
    icon: 'ability_revendreth_shaman',
    manaCost: 1000,
  },
  CHAIN_HARVEST_HEAL: {
    id: 320751,
    name: 'Chain Harvest',
    icon: 'ability_revendreth_shaman',
  },
  CHAIN_HARVEST_DAMAGE: {
    id: 320752,
    name: 'Chain Harvest',
    icon: 'ability_revendreth_shaman',
  },
  //endregion
});
export default covenants;
