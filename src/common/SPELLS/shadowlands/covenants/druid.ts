const covenants = {
  //region Kyrian
  KINDRED_SPIRITS: {
    id: 326434,
    name: 'Kindred Spirits',
    icon: 'ability_bastion_druid',
  },
  //endregion

  //region Necrolord
  ADAPTIVE_SWARM: {
    // cast
    id: 325727,
    name: 'Adaptive Swarm',
    icon: 'ability_maldraxxus_druid',
  },
  ADAPTIVE_SWARM_HEAL: {
    // buff, heal
    id: 325748,
    name: 'Adaptive Swarm',
    icon: 'ability_maldraxxus_druid',
  },
  ADAPTIVE_SWARM_DAMAGE: {
    // debuff, damage
    id: 325733,
    name: 'Adaptive Swarm',
    icon: 'ability_maldraxxus_druid',
  },
  //endregion

  //region Night Fae
  CONVOKE_SPIRITS: {
    id: 323764,
    name: 'Convoke the Spirits',
    icon: 'ability_ardenweald_druid',
  },
  //endregion

  //region Venthyr
  RAVENOUS_FRENZY: {
    id: 323546,
    name: 'Ravenous Frenzy',
    icon: 'ability_revendreth_druid',
  },
  //endregion
} as const;
export default covenants;
