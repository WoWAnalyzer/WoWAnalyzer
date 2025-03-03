import { buildBoss } from 'game/raids/builders';

export const Sikran = buildBoss({
  id: 2898,
  name: 'Sikran, Captain of the Sureki',
  timeline: {
    abilities: [
      {
        // Phase Blades (charges)
        id: 433519,
        type: 'cast',
      },
      {
        // Shattering Sweep
        id: 456420,
        type: 'begincast',
      },
      {
        // Decimate (beams)
        id: 442428,
        type: 'begincast',
      },
    ],
    debuffs: [
      {
        // Phase Blades (charges)
        id: 433517,
      },
      {
        // Decimate (beams)
        id: 439191,
      },
    ],
  },
});
