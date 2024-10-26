import Spell from '../Spell';

const spells = {
  // Signet of the Priory
  BOLSTERING_LIGHT: {
    id: 443531,
    name: 'Bolstering Light',
    icon: 'inv_arathordungeon_signet_color1',
  },
  // Spymaster's Web
  SPYMASTERS_WEB: {
    id: 444959,
    name: "Spymaster's Web",
    icon: 'ability_spy',
  },
  SPYMASTERS_REPORT: {
    id: 451199,
    name: "Spymaster's Report",
    icon: 'inv_nerubianspiderling2_black',
  },
  QUICKWICK_CANDLESTICK_HASTE: {
    id: 455451,
    name: "Quickwick's Quick Trick Wick Walk",
    icon: 'trade_archaeology_candlestub',
  },
  // Treacherous Transmitter
  CRYPTIC_INSTRUCTIONS: {
    id: 449946,
    name: 'Cryptic Instructions',
    icon: 'inv_etherealraid_communicator_color1',
  },
} satisfies Record<string, Spell>;

export default spells;
