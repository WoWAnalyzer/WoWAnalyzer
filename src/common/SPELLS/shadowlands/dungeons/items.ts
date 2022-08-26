// Spells such as on use casts or buffs triggered by items from any dungeon
import { spellIndexableList } from '../../Spell';

const dungeonItemSpells = spellIndexableList({
  //De Other Side
  INSCRUTABLE_QUANTUM_DEVICE_CAST: {
    id: 330323,
    name: 'Inscrutable Quantum Device',
    icon: 'inv_trinket_80_titan02a',
  },
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
  INSCRUTABLE_QUANTUM_DEVICE_HEAL: {
    id: 330364,
    name: 'Inscrutable Quantum Device',
    icon: 'inv_trinket_80_titan02a',
  },
  INSCRUTABLE_QUANTUM_DEVICE_MANA: {
    id: 330376,
    name: 'Inscrutable Quantum Device',
    icon: 'inv_trinket_80_titan02a',
  },
  INSCRUTABLE_QUANTUM_DEVICE_CC_BREAK: {
    id: 330363,
    name: 'Inscrutable Quantum Device',
    icon: 'inv_trinket_80_titan02a',
  },
  INSCRUTABLE_QUANTUM_DEVICE_DECOY: {
    id: 330372,
    name: 'Inscrutable Quantum Device',
    icon: 'inv_trinket_80_titan02a',
  },
  INSCRUTABLE_QUANTUM_DEVUCE_DECOY_DISTRACT: {
    id: 347940,
    name: 'Inscrutable Quantum Device',
    icon: 'inv_trinket_80_titan02a',
  },
  INSCRUTABLE_QUANTUM_DEVICE_EXECUTE: {
    id: 330373,
    name: 'Inscrutable Quantum Device',
    icon: 'inv_trinket_80_titan02a',
  },
  SHADOWGRASP_TOTEM_SUMMON: {
    id: 331523,
    name: 'Shadowgrasp Totem',
    icon: 'inv_alchemy_83_alchemiststone02',
  },
  SHADOWGRASP_TOTEM_DAMAGE: {
    id: 331537,
    name: 'Shadowgrasp Totem',
    icon: 'inv_alchemy_83_alchemiststone02',
  },
  SHADOWGRASP_TOTEM_HEAL: {
    id: 329872,
    name: 'Shadowgrasp Totem',
    icon: 'inv_alchemy_83_alchemiststone02',
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
  //Theater of Pain
  SOULLETTING_RUBY_CAST: {
    id: 345801,
    name: 'Soulletting Ruby',
    icon: 'inv_jewelcrafting_livingruby_01',
  },
  // SOULLETTING_RUBY_UNKNOWN: {
  //   id: 345802,
  //   name: 'Soul Fragment',
  //   icon: 'spell_warlock_soulburn',
  // },
  // SOULLETTING_RUBY_UNKNOWN_2: {
  //   id: 345803,
  //   name: 'Soul Fragment',
  //   icon: 'spell_warlock_soulburn',
  // },
  SOULLETTING_RUBY_HEAL: {
    id: 345804,
    name: 'Soul Transfer',
    icon: 'spell_warlock_soulburn',
  },
  SOULLETTING_RUBY_BUFF: {
    id: 345805,
    name: 'Soul Infusion',
    icon: 'spell_warlock_soulburn',
  },
  // SOULLETTING_RUBY_BUFF_2: {
  //   id: 345806,
  //   name: 'Soul Infusion',
  //   icon: 'spell_warlock_soulburn',
  // },
  // SOULLETTING_RUBY_BUFF_3: {
  //   id: 345807,
  //   name: 'Soul Infusion',
  //   icon: 'spell_warlock_soulburn',
  // },
  //Tazavesh: Streets
  CODEX_OF_THE_FIRST_TECHNIQUE_DAMAGE: {
    id: 351450,
    name: 'Riposte of the First Technique',
    icon: 'inv_misc_profession_book_enchanting',
  },
  CODEX_OF_THE_FIRST_TECHNIQUE_HEALING: {
    id: 351316,
    name: 'First Technique',
    icon: 'inv_misc_profession_book_enchanting',
  },
  BLOOD_SPATTERED_SCALE_DAMAGE: {
    id: 329840,
    name: 'Blood Barrier',
    icon: 'inv_misc_scales_stonyorange',
  },
  BLOOD_SPATTERED_SCALE_HEALING: {
    id: 329849,
    name: 'Blood Barrier',
    icon: 'inv_misc_scales_stonyorange',
  },
  // Mists of Tirna Scithe
  UNBOUND_CHANGELING_ALL_BUFF: {
    id: 330764,
    name: 'Unbound Changeling',
    icon: 'spell_animaardenweald_nova',
  },
  UNBOUND_CHANGELING_CRIT_BUFF: {
    id: 330730,
    name: 'Unbound Changeling',
    icon: 'inv_pet_spectralporcupinered',
  },
  UNBOUND_CHANGELING_HASTE_BUFF: {
    id: 330131,
    name: 'Unbound Changeling',
    icon: 'inv_pet_spectralporcupinegreen',
  },
  UNBOUND_CHANGELING_MASTERY_BUFF: {
    id: 330729,
    name: 'Unbound Changeling',
    icon: 'inv_pet_spectralporcupineblue',
  },
});

export default dungeonItemSpells;
