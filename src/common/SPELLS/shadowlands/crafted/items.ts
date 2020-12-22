// Spells such as on use casts or buffs triggered by items from any crafted trinket
const craftedItemSpells = {
  /** Darkmoon Deck: Voracity */
  ACE_OF_VORACITY: {
    id: 311483,
    name: 'Ace of Voracity',
    icon: 'inv_inscription_darkmooncard_voracity_a',
  },
  TWO_OF_VORACITY: {
    id: 311484,
    name: 'Two of Voracity',
    icon: 'inv_inscription_darkmooncard_voracity_2',
  },
  THREE_OF_VORACITY: {
    id: 311485,
    name: 'Three of Voracity',
    icon: 'inv_inscription_darkmooncard_voracity_3',
  },
  FOUR_OF_VORACITY: {
    id: 311486,
    name: 'Four of Voracity',
    icon: 'inv_inscription_darkmooncard_voracity_4',
  },
  FIVE_OF_VORACITY: {
    id: 311487,
    name: 'Five of Voracity',
    icon: 'inv_inscription_darkmooncard_voracity_5',
  },
  SIX_OF_VORACITY: {
    id: 311488,
    name: 'Six of Voracity',
    icon: 'inv_inscription_darkmooncard_voracity_6',
  },
  SEVEN_OF_VORACITY: {
    id: 311489,
    name: 'Seven of Voracity',
    icon: 'inv_inscription_darkmooncard_voracity_7',
  },
  EIGHT_OF_VORACITY: {
    id: 311490,
    name: 'Eight of Voracity',
    icon: 'inv_inscription_darkmooncard_voracity_8',
  },
  VORACIOUS_HASTE: {
    id: 311491,
    name: 'Voracious Haste',
    icon: 'inv_inscription_darkmooncard_voracity',
  },
  VORACIOUS_HUNGER: {
    id: 331624,
    name: 'Voracious Hunger',
    icon: 'inv_inscription_darkmooncard_voracity', //actual icon is trade_engineering, but that's pretty non-descriptive
  },
  VORACIOUS_LETHARGY: {
    id: 329449,
    name: 'Voracious Lethargy',
    icon: 'inv_inscription_darkmooncard_voracity',
  },
} as const;

export default craftedItemSpells;
