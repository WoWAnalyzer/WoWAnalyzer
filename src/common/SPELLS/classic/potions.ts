import Spell from '../Spell';

const spells = {
  // 4000 int
  POTION_OF_THE_JADE_SERPENT: {
    id: 105702,
    name: 'Potion of the Jade Serpent',
    icon: 'trade_alchemy_potiond4.jpg',
  },
  // 4000 agi
  VIRMENS_BITE: {
    id: 105697,
    name: "Virmen's Bite",
    icon: 'trade_alchemy_potiond6.jpg',
  },
  // 4000 str
  POTION_OF_MOGU_POWER: {
    id: 105706,
    name: 'Potion of Mogu Power',
    icon: 'trade_alchemy_potiond5.jpg',
  },
  // sleepy mana pot
  POTION_OF_FOCUS: {
    id: 105701,
    name: 'Potion of Focus',
    icon: 'trade_alchemy_potion_d2.jpg',
  },
  MASTER_HEALING_POTION: {
    id: 105708,
    name: 'Master Healing Potion',
    icon: 'trade_alchemy_potiona2.jpg',
  },
  MASTER_MANA_POTION: {
    id: 105709,
    name: 'Master Mana Potion',
    icon: 'trade_alchemy_potiona5.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
