const soulbindPowers = {
  SOOTHING_SHADE: {
    // FIXME Soothing Shade has 2 other spell IDs on wowhead, but I haven't seen them show up in a log yet.
    //   Leaving them un-added here so we'll get console logs if they do decide to show up
    id: 336885,
    name: 'Soothing Shade',
    icon: 'archaeology_5_0_umbrellaofchiji',
  },
  WATCH_THE_SHOES: {
    id: 336140,
    name: 'Watch the Shoes!',
    icon: 'inv_raidpriestmythic_q_01boot',
  },
  LEISURELY_GAIT: {
    id: 336147,
    name: 'Leisurely Gait',
    icon: 'spell_lifegivingspeed',
  },
  LIFE_OF_THE_PARTY: {
    id: 336247,
    name: 'Life of the Party',
    icon: 'achievement_halloween_smiley_01',
  },
  EXQUISITE_INGREDIENTS: {
    id: 336184,
    name: 'Exquisite Ingredients',
    icon: 'achievement_guildperk_bountifulbags',
  },
  TOKEN_OF_APPRECIATION: {
    id: 337470,
    name: 'Token of Appreciation',
    icon: 'inv_misc_coin_01',
  },
  REFINED_PALATE: {
    id: 336245,
    name: 'Token of Appreciation',
    icon: 'inv_misc_coin_01',
  },
  WASTELAND_PROPRIETY: {
    id: 319983,
    name: 'Wasteland Propriety',
    icon: 'inv_drink_23',
  },
  WASTELAND_PROPRIETY_FRIEND_BUFF: {
    id: 333251,
    name: 'Wasteland Propriety',
    icon: 'inv_drink_23',
  },
  WASTELAND_PROPRIETY_SELF_BUFF: {
    id: 333218,
    name: 'Wasteland Propriety',
    icon: 'inv_drink_23',
  },
} as const;
export default soulbindPowers;
