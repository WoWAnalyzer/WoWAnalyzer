import Spell from '../Spell';

const spells = {
  INCORPOREAL_ESSENCE_GORGER: {
    id: 1244410,
    name: 'Incorporeal Essence-Gorger',
    icon: 'inv_throwingknife_06',
  },
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
  // Ovinax Mercurial Egg
  SUSPENDED_INCUBATION: {
    id: 445560,
    name: 'Suspended Incubation',
    icon: 'inv_raid_mercurialegg_purple',
  },
  //Mad Queen's Mandate
  ABYSSAL_GLUTTONY: {
    id: 443124,
    name: 'Abyssal Gluttony',
    icon: 'ability_creature_poison_01_purple',
  },
  //Skardyns Grace
  SPEED_OF_THOUGHT: {
    id: 92099,
    name: 'Speed of Thought',
    icon: 'ability_mage_studentofthemind',
  },
  MERELDARS_TOLL_USE: {
    id: 450561,
    name: "Mereldar's Toll",
    icon: 'inv_arathordungeon_bell_color1',
  },
  MERELDARS_TOLL_DAMAGE: {
    id: 443539,
    name: "Mereldar's Toll",
    icon: 'inv_arathordungeon_bell_color1',
  },
  MERELDARS_TOLL_VERS: {
    id: 450551,
    name: "Mereldar's Toll",
    icon: 'inv_arathordungeon_bell_color1',
  },
  STRAND_OF_THE_ASCENDED: {
    id: 452337,
    name: 'Strand of the Ascended',
    icon: 'inv_11_0_dungeon_tentaclevial_red',
  },
  STRAND_OF_THE_LORD: {
    id: 452288,
    name: 'Strand of the Lord',
    icon: 'inv_11_0_dungeon_tentaclevial_red',
  },
  STRAND_OF_THE_QUEEN: {
    id: 452360,
    name: 'Strand of the Queen',
    icon: 'inv_11_0_dungeon_tentaclevial_red',
  },
  STRAND_OF_THE_SAGE: {
    id: 452367,
    name: 'Strand of the Sage',
    icon: 'inv_11_0_dungeon_tentaclevial_red',
  },
  STRAND_OF_THE_SUNDERED_TANK_BUFF: {
    id: 452361,
    name: 'Strand of the Sundered',
    icon: 'inv_11_0_dungeon_tentaclevial_red',
  },
  STRAND_OF_THE_SUNDERED_DPS_BUFF: {
    id: 452365,
    name: 'Strand of the Sundered',
    icon: 'inv_11_0_dungeon_tentaclevial_red',
  },
  STRAND_OF_THE_SUNDERED_HEALER_BUFF: {
    id: 452366,
    name: 'Strand of the Sundered',
    icon: 'inv_11_0_dungeon_tentaclevial_red',
  },
} satisfies Record<string, Spell>;

export default spells;
