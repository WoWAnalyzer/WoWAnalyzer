const legendaries = {
  //region Beast Mastery
  DIRE_COMMAND_EFFECT: {
    id: 336819,
    name: 'Dire Command',
    icon: 'ability_hunter_sickem',
    bonusID: 7007,
  },
  FLAMEWAKERS_COBRA_STING_EFFECT: {
    id: 336822,
    name: 'Flamewaker\'s Cobra Sting',
    icon: 'ability_hunter_cobrashot',
    bonusID: 7008,
  },
  QAPLA_EREDUN_WAR_ORDER_EFFECT: {
    id: 336830,
    name: 'Qa\'pla, Eredun War Order',
    icon: 'ability_hunter_barbedshot',
    bonusID: 7009,
  },
  RYLAKSTALKERS_PIERCING_FANGS_EFFECT: {
    id: 336844,
    name: 'Rylakstalker\'s Piercing Fangs',
    icon: 'inv_misc_monsterfang_02',
    bonusID: 7010,
  },
  FLAMEWAKERS_COBRA_STING_BUFF: {
    id: 336826,
    name: 'Flamewaker\'s Cobra Sting',
    icon: 'ability_hunter_cobrashot',
  },
  //endregion

  //region Marksmanship
  EAGLETALONS_TRUE_FOCUS_EFFECT: {
    id: 336849,
    name: 'Eagletalon\'s True Focus',
    icon: 'ability_trueshot',
    bonusID: 7011,
  },
  EAGLETALONS_TRUE_FOCUS_BUFF: {
    id: 336851,
    name: 'Eagletalon\'s True Focus',
    icon: 'ability_trueshot',
  },
  SURGING_SHOTS_EFFECT: {
    id: 336867,
    name: 'Surging Shots',
    icon: 'ability_hunter_resistanceisfutile',
    bonusID: 7012,
  },
  SERPENTSTALKERS_TRICKERY_EFFECT: {
    id: 336870,
    name: 'Serpentstalker\'s Trickery',
    icon: 'inv_spear_07',
    bonusID: 7013,
  },
  SECRETS_OF_THE_UNBLINKING_VIGIL_EFFECT: {
    id: 336878,
    name: 'Secrets of the Unblinking Vigil',
    icon: 'inv_trickshot',
    bonusID: 7014,
  },
  SECRETS_OF_THE_UNBLINKING_VIGIL_BUFF: {
    id: 336892,
    name: 'Secrets of the Unblinking Vigil',
    icon: 'inv_trickshot',
  },

  //endregion

  //region Survival
  WILDFIRE_CLUSTER_EFFECT: {
    id: 336895,
    name: 'Wildfire Cluster',
    icon: 'inv_trickshot',
    bonusID: 7015,
  },
  WILDFIRE_CLUSTER_DAMAGE: {
    id: 272745,
    name: 'Wildfire Cluster',
    icon: 'spell_mage_flameorb',
  },
  RYLAKSTALKERS_CONFOUNDING_STRIKES_EFFECT: {
    id: 336901,
    name: 'Rylakstalker\'s Confounding Strikes',
    icon: 'ability_searingarrow',
    bonusID: 7016,
  },
  LATENT_POISON_INJECTORS_EFFECT: {
    id: 336902,
    name: 'Latent Poison Injectors',
    icon: 'ability_poisonarrow',
    bonusID: 7017,
  },
  LATENT_POISON_INJECTORS_DEBUFF: {
    id: 336903,
    name: 'Latent Poison Injectors',
    icon: 'ability_poisonarrow',
  },
  LATENT_POISON_INJECTORS_DAMAGE: {
    id: 336904,
    name: 'Latent Poison Injectors',
    icon: 'ability_poisonarrow',
  },
  BUTCHERS_BONE_FRAGMENTS_EFFECT: {
    id: 336907,
    name: 'Butcher\'s Bone Fragments',
    icon: 'inv_skinning_80_bloodsoakedbone',
    bonusID: 7018,
  },
  BUTCHERS_BONE_FRAGMENTS_BUFF: {
    id: 336908,
    name: 'Butcher\'s Bone Fragments',
    icon: 'inv_skinning_80_bloodsoakedbone',
  },
  //endregion

  //region Shared
  CALL_OF_THE_WILD_EFFECT: {
    id: 336742,
    name: 'Call of the Wild',
    icon: 'ability_hunter_invigeration',
    bonusID: 7003,
  },
  NESINGWARYS_TRAPPING_APPARATUS_EFFECT: {
    id: 336743,
    name: 'Nesingwary\'s Trapping Apparatus',
    icon: 'ability_hunter_invigeration',
    bonusID: 7004,
  },
  NESINGWARYS_TRAPPING_APPARATUS_ENERGIZE: {
    id: 336744,
    name: 'Nesingwary\'s Trapping Apparatus',
    icon: 'ability_hunter_traplauncher',
  },
  SOULFORGE_EMBERS_EFFECT: {
    id: 336745,
    name: 'Soulforge Embers',
    icon: 'ability_warlock_burningembers',
    bonusID: 7005,
  },
  SOULFORGE_EMBERS_DAMAGE: {
    id: 336746,
    name: 'Soulforge Embers',
    icon: 'ability_warlock_burningembers',
  },
  CRAVEN_STRATEGEM_EFFECT: {
    id: 336747,
    name: 'Craven Strategem',
    icon: 'ability_rogue_feigndeath',
    bonusID: 7006,
  },
  //endregion
} as const;
export default legendaries;
