import { buildBoss } from 'game/raids/builders';
import background from './backgrounds/SilkenCourt.jpg';

export const SilkenCourt = buildBoss({
  id: 2921,
  name: 'The Silken Court',
  background,
  timeline: {
    abilities: [
      {
        // Venemous Rain
        id: 438343,
        type: 'cast',
      },
      {
        // Reckless Charge
        id: 440246,
        type: 'begincast',
      },
      {
        // Web Vortex
        id: 441626,
        type: 'cast',
      },
      {
        // Cataclysmic Entropy (raid-wipe cast that dispels stop)
        id: 438355,
        type: 'begincast',
      },
      {
        // Stinging Swarm (dispels)
        id: 438677,
        type: 'cast',
      },
    ],
    debuffs: [
      {
        // Impaled (stun)
        id: 449857,
      },
      {
        // Stinging Swarm
        id: 438708,
      },
      {
        // Binding Webs (webs for stopping boss)
        id: 440001,
      },
    ],
  },
});
