import { buildBoss } from '../builders';
import background from './backgrounds/Dimensius.jpg';

export default buildBoss({
  id: 3135,
  name: 'Dimensius',
  background,
  timeline: {
    abilities: [
      // Phase 1
      {
        id: 1229038, // Devour
        type: 'cast',
      },
      {
        id: 1230979, // Dark Matter (spread circles)
        type: 'cast',
      },
      {
        id: 1230087, // Massive Smash
        type: 'begincast', // need to use begin because sometimes the completion doesn't log?
      },
      // Phase 2
      {
        id: 1238765, // Extinction (smash)
        type: 'cast',
      },
      // pushback beam doesn't log as a cast?
      {
        id: 1239262, // Conqueror's Cross
        type: 'cast',
      },
      {
        id: 1237694, // Mass Ejection (Artoshion beam)
        type: 'cast',
      },
      {
        id: 1237695, // Stardust Nova
        type: 'cast',
      },
      // Phase 3
      {
        id: 1232973, // Supernova (run away)
        type: 'cast',
      },
      {
        id: 1234263, // Cosmic Collapse (tank hit + grip)
        type: 'cast',
      },
      {
        id: 1233539, // Devour
        type: 'cast',
      },
      {
        id: 1234044, // Darkened Sky (dausegne rings)
        type: 'cast',
      },
    ],
    debuffs: [
      {
        id: 1228206, // Excess Mass
      },
      {
        id: 1243577, // Reverse Gravity (target)
      },
      {
        id: 1243609, // Airborne
      },
      {
        id: 1228207, // Collective Gravity
      },
      {
        id: 1237325, // Gamma Burst (p2 pushback)
      },
      {
        id: 1232394, // Gravity Well
      },
      {
        id: 1230674, // Spaghettification
      },
    ],
  },
});
