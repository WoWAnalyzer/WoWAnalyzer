import type { Boss } from 'game/raids';

import Headshot from './images/ShaOfFearHeadshot.jpg';
import Background from './images/ShaOfFear.jpg';

const ShaOfFear: Boss = {
  id: 1431,
  name: 'Sha of Fear',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_terraceofendlessspring04',
  fight: {
    resultsWarning:
      'The side platforms in Phase 1 have range issues, which can cause ANALYSIS ERRORS. Phase 2 does not have this problem.',
    timeline: {
      abilities: [
        {
          // Submerge
          id: 120455,
          type: 'cast',
        },
        {
          // Ominous Cackle 1
          id: 119593,
          type: 'cast',
        },
        {
          // Ominous Cackle 2
          id: 119693,
          type: 'cast',
        },
        {
          // Ominous Cackle 3
          id: 119692,
          type: 'cast',
        },
        {
          // Fading Light
          id: 129378,
          type: 'cast',
        },
      ],
      debuffs: [
        {
          // Huddle in Terror
          id: 120629,
        },
        {
          // Sha Globe (rage/energy/mana refill)
          id: 129189,
        },
      ],
    },
  },
};

export default ShaOfFear;
