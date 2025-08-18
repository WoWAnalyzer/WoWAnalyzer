import { buildBoss } from '../builders';
import background from './backgrounds/NexusKingSalhadaar.jpg';

export default buildBoss({
  id: 3134,
  name: 'Nexus-King Salhadaar',
  background,
  timeline: {
    abilities: [
      {
        id: 1224906, // Invoke the Oath (end of P1 mass-MC)
        type: 'cast',
      },
      {
        id: 1224812, // Vanquish (frontal cone p1)
        type: 'cast',
      },
      {
        id: 1224787, // Conquer (group soak p1)
        type: 'cast',
      },
      {
        id: 1225010, // Command Behead (claws)
        type: 'cast',
      },
      {
        id: 1228163, // Dimension Breath (tank)
        type: 'cast',
      },
      {
        id: 1228115, // Netherbreaker (p2 big circles)
        type: 'begincast',
      },
      {
        id: 1227734, // Coalesce Voidwing
        type: 'cast',
      },
      {
        id: 1228075, // Nexus Beams (i1 spinnies)
        type: 'cast',
      },
      {
        id: 1226442, // Starkiller Swing (there are MANY spells for this)
        type: 'cast',
      },
      {
        id: 1225319, // Galactic Smash (star spawn)
        type: 'cast',
      },
    ],
    debuffs: [
      {
        id: 1224864, // Behead
      },
      {
        id: 1228114, // Netherbreaker
      },
      {
        id: 1228196, // Dimension Breath (both tank and others)
      },
      {
        id: 1249240, // King's Thrall (mind control)
      },
      {
        id: 1225316, // Galactic Smash (Starkiller spawns)
      },
    ],
  },
});
