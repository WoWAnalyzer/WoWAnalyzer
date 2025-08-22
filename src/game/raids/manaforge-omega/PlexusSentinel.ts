import { buildBoss } from '../builders';
import background from './backgrounds/PlexusSentinel.jpg';

export default buildBoss({
  id: 3129,
  name: 'Plexus Sentinel',
  background,
  timeline: {
    abilities: [
      {
        id: 1219450, // Manifest Matrices
        type: 'cast',
      },
      {
        id: 1219263, // Obliteration Arcanocannon
        type: 'cast',
      },
      {
        id: 1219531, // Eradicating Salvo
        type: 'begincast',
      },
    ],
    debuffs: [
      {
        id: 1219459, // Manifest Matrices (drop)
      },
      {
        id: 1219439, // Obliteration Arcanocannon (drop)
      },
      {
        id: 1219607, // Eradicating Salvo (soak target)
      },
    ],
  },
});
