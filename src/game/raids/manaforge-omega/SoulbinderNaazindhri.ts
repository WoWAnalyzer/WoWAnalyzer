import { buildBoss } from '../builders';
import background from './backgrounds/SoulbinderNaazindhri.jpg';

export default buildBoss({
  id: 3130,
  name: 'Soulbinder Naazindhri',
  background,
  timeline: {
    abilities: [
      {
        id: 1225616, // Soulfire Convergence (stars)
        type: 'cast',
      },
      {
        id: 1227276, // Soulfray Annihilation (beams),
        type: 'cast',
      },
      {
        id: 1241100, // Mystic Lash (tank hit)
        type: 'cast',
      },
      {
        id: 1223859, // Arcane Expulsion (knock)
        type: 'cast',
      },
      {
        id: 1225582, // Soul Calling (new add canisters)
        type: 'cast',
      },
      {
        id: 1219040, // Soulweave (add spawn)
        type: 'cast',
      },
    ],
    debuffs: [
      {
        id: 1225626, // Soulfire Convergence (star target)
      },
      {
        id: 1227276, // Soulfray Annihilation (beam target)
      },
      {
        id: 1248979, // Voidblade Ambush (ambush target---mostly relevant for Mythic where it cleaves)
      },
    ],
  },
});
