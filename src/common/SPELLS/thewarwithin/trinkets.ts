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
} satisfies Record<string, Spell>;

export default spells;
