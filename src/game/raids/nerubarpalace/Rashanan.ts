import { buildBoss } from 'game/raids/builders';
import background from './backgrounds/Rashanan.jpg';

export const Rashanan = buildBoss({
  id: 2918,
  name: "Rasha'nan",
  background,
  timeline: {
    abilities: [
      {
        // Erosive Spray (raidwide dot, also precedes movement)
        id: 439811,
        type: 'cast',
      },
      {
        // Web Reave (cast at the end of the movement)
        id: 439795,
        type: 'cast',
      },
    ],
    debuffs: [
      {
        // Spinneret's Strands (web drops)
        id: 439783,
      },
      {
        // Infested Spawn (add spawns)
        id: 439815,
      },
      {
        // Enveloping Webs (stunned)
        id: 454991,
      },
    ],
  },
});
