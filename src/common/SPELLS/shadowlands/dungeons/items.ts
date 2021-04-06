// Spells such as on use casts or buffs triggered by items from any dungeon
const dungeonItemSpells = {
  //De Other Side
  INSCRUTABLE_QUANTUM_DEVICE_CRIT: {
    id: 330366,
    name: 'Inscrutable Quantum Device',
    icon: 'inv_trinket_80_titan02a',
  },
  INSCRUTABLE_QUANTUM_DEVICE_HASTE: {
    id: 330368,
    name: 'Inscrutable Quantum Device',
    icon: 'inv_trinket_80_titan02a',
  },
  INSCRUTABLE_QUANTUM_DEVICE_VERS: {
    id: 330367,
    name: 'Inscrutable Quantum Device',
    icon: 'inv_trinket_80_titan02a',
  },
  INSCRUTABLE_QUANTUM_DEVICE_MASTERY: {
    id: 330380,
    name: 'Inscrutable Quantum Device',
    icon: 'inv_trinket_80_titan02a',
  },
  //Spires of Ascension
  OVERCHARGED_ANIMA_BATTERY_BUFF: {
    id: 345530,
    name: 'Overcharged Anima Battery',
    icon: 'inv_battery_01',
  },
  ANIMA_FIELD_EMITTER_BUFF: {
    id: 345535,
    name: 'Anima Field',
    icon: 'inv_trinket_oribos_01_silver',
  },
} as const;

export default dungeonItemSpells;
