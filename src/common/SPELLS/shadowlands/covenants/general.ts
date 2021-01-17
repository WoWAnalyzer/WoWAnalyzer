const covenants = {
  //region Kyrian
  SUMMON_STEWARD: {
    id: 324739,
    name: 'Summon Steward',
    icon: 'ability_kyrian_summonsteward',
  },
  PURIFY_SOUL: {
    id: 323436,
    name: 'Purify Soul',
    icon: 'inv_misc_flaskofvolatility',
  },
  //endregion

  //region Necrolord
  FLESHCRAFT: {
    id: 331180,
    name: 'Fleshcraft',
    icon: 'ability_necrolord_fleshcraft',
  },
  //endregion

  //region Night Fae
  SOULSHAPE: {
    id: 310143,
    name: 'Soulshape',
    icon: 'ability_nightfae_flicker',
  },
  //endregion

  //region Venthyr
  DOOR_OF_SHADOWS: {
    id: 300728,
    name: 'Door of Shadows',
    icon: 'ability_venthyr_doorofshadows',
  }
  //endregion
} as const;
export default covenants;
