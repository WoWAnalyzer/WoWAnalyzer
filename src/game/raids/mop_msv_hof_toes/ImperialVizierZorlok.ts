import type { Boss } from 'game/raids';

import Headshot from './images/ImperialVizierZorlokHeadshot.jpg';
import Background from './images/ImperialVizierZorlok.jpg';

const ImperialVizierZorlok: Boss = {
  id: 1507,
  name: "Imperial Vizier Zor'lok",
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_mantidraid02',
  fight: {
    timeline: {
      abilities: [
        {
          id: 127834, // Attenuation
          type: 'cast',
        },
        {
          id: 122713, // Force and Verve
          type: 'cast',
        },
        {
          id: 122740, // Convert
          type: 'cast',
        },
        {
          id: 122761, // Exhale
          type: 'cast',
        },
      ],
      debuffs: [
        {
          id: 122706, // Noise Cancelling
        },
        {
          id: 122740, // Convert (mind control)
        },
        {
          id: 122761, // Exhale (target?)
        },
      ],
    },
  },
};

export default ImperialVizierZorlok;
