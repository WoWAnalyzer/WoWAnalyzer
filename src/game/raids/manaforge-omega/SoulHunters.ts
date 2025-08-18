import { buildBoss } from '../builders';
import background from './backgrounds/SoulHunters.jpg';

export default buildBoss({
  id: 3122,
  name: 'The Soul Hunters',
  background,
  timeline: {
    abilities: [
      {
        id: 1227355, // Voidstep (leap)
        type: 'cast',
      },
      {
        id: 1218103, // Eye Beam
        type: 'begincast',
      },
      {
        id: 1241833, // Fracture
        type: 'cast',
      },
      {
        id: 1227809, // The Hunt
        type: 'cast',
      },
    ],
    debuffs: [
      {
        id: 1222232, // Devourer's Ire (light-holder debuff)
      },
      {
        id: 1227847, // The Hunt (target)
      },
      {
        id: 1218103, // Eye Beam (target)
      },
    ],
  },
});
