import { buildBoss } from '../builders';
import Background from './backgrounds/Sprocketmonger.jpg';

export default buildBoss({
  id: 3013,
  name: 'Sprocketmonger Lockenstock',
  background: Background,
  timeline: {
    abilities: [
      {
        // Foot Blasters -- summon mines
        id: 1217231,
        type: 'cast',
      },
      {
        // Screw Up
        id: 1216508,
        type: 'cast',
      },
      {
        // Activate Inventions
        id: 473276,
        type: 'cast',
      },
      {
        // Wire Transfer (platforms change)
        id: 1218418,
        type: 'cast',
      },
    ],
    debuffs: [
      {
        // Screw Up (dropping screws)
        id: 1216509,
      },
      {
        // Screwed! (stunned)
        id: 1217261,
      },
      {
        // Pyro Party Pack (tank run out)
        id: 1214878,
      },
    ],
  },
});
