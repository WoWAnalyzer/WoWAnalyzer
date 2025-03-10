import { buildBoss } from '../builders';
import background from './backgrounds/Gallywix.jpg';

export default buildBoss({
  id: 3016,
  background,
  name: 'Chrome King Gallywix',
  timeline: {
    debuffs: [
      {
        // Sapper's Satchel
        id: 466155,
      },
      {
        // Charged Giga Bomb --- bomb carrying
        id: 469362,
      },
      {
        // Focused Detonation --- clicking tank bombs on heroic+. not strictly downtime causing, but useful context for downtime
        id: 466246,
      },
      {
        // Fused Canisters --- players with soaks
        id: 466344,
      },
    ],
    abilities: [
      {
        // Big Bad Buncha Bombs
        id: 465952,
        type: 'begincast',
      },
      {
        // Bigger Badder Bomb Blast
        id: 1214607,
        type: 'begincast',
      },
      {
        // Gallybux Finale Blast (run away)
        type: 'begincast',
        id: 1219333,
      },
    ],
  },
});
