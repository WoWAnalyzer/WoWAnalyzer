const legendaries = {
  //region Arms
  ENDURING_BLOW: {
    id: 335458,
    name: 'Enduring Blow',
    icon: 'ability_titankeeper_piercingcorruption',
    bonusID: 6962,
  },
  //endregion

  //region Fury

  //endregion

  //region Protection
  THE_WALL: {
    id: 335239,
    name: 'The Wall',
    icon: 'ability_warrior_shieldguard',
    bonusID: 6957,
  },
  THUNDERLORD: {
    id: 335229,
    name: 'Thunderlord',
    icon: 'ability_vehicle_electrocharge',
    bonusID: 6956,
  },
  //endregion

  //region Shared
  SIGNET_OF_TORMENTED_KINGS: {
    id: 335266,
    name: 'Signet of Tormented Kings',
    icon: 'inv_60crafted_ring4b',
    bonusID: 6959,
  },
  //endregion
} as const;
export default legendaries;
