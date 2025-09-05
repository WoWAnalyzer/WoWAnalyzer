import { buildBoss } from '../builders';
import background from './backgrounds/Fractillus.jpg';

export default buildBoss({
  id: 3133,
  name: 'Fractillus',
  background,
  timeline: {
    abilities: [
      {
        id: 1220394, // Shattering Backhand (wall breaks)
        type: 'cast',
      },
      {
        id: 1231871, // Shockwave Slam (tank walls)
        type: 'cast',
      },
      {
        id: 1233416, // Crystalline Shockwave (raid walls)
        type: 'cast',
      },
    ],
    debuffs: [
      {
        id: 1233411, // Crystalline Shockwave (target)
      },
      {
        id: 1227373, // Shattershell (wall break targets)
      },
      {
        id: 1247424, // Null Consumption (purple circles after breaks)
      },
    ],
  },
});
