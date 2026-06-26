import type { Raid } from 'game/raids';
import { buildBoss } from 'game/raids/builders';
import background from './background.jpg';

export default {
  name: 'Sporefall',
  background,
  bosses: {
    Rotmire: buildBoss({
      id: 3159,
      name: 'Rotmire',
      timeline: {
        abilities: [
          {
            // Bursting Pustules (ramping raid damage)
            id: 1221787,
            type: 'cast',
          },
          {
            // Awaken Fungi
            id: 1221622,
            type: 'cast',
          },
          {
            // Fungal Bloom
            id: 1221637,
            type: 'cast',
          },
        ],
        debuffs: [
          {
            id: 1299508, // Fungling fixate
          },
          {
            id: 1221639, // Shroomling fixate
          },
          {
            id: 1222088, // Festering Vines
          },
        ],
      },
    }),
  },
} satisfies Raid;
