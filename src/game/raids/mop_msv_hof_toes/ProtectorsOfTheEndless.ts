import type { Boss } from 'game/raids';

import Headshot from './images/ProtectorsOfTheEndlessHeadshot.jpg';
import Background from './images/ProtectorsOfTheEndless.jpg';

const ProtectorsOfTheEndless: Boss = {
  id: 1409,
  name: 'Protectors of the Endless',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_terraceofendlessspring01',
  fight: {
    timeline: {
      debuffs: [
        {
          // Corrupted Essence
          id: 118191,
        },
        {
          // Lightning Prison (targetted)
          id: 111850,
        },
        {
          // Lightning Prison (stunned)
          id: 117436,
        },
      ],
      abilities: [
        {
          // Expel Corruption
          id: 117975,
          type: 'cast',
        },
        {
          // Lightning Prison
          id: 122874,
          type: 'cast',
        },
        {
          // Cleansing Waters
          id: 117309,
          type: 'cast',
        },
        {
          // Corrupted Waters
          id: 117227,
          type: 'cast',
        },
      ],
    },
  },
};

export default ProtectorsOfTheEndless;
