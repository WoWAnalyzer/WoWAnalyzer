import type { Boss } from 'game/raids';

import Headshot from './images/GrandEmpressShekzeerHeadshot.jpg';
import Background from './images/GrandEmpressShekzeer.jpg';

const GrandEmpressShekzeer: Boss = {
  id: 1501,
  name: "Grand Empress Shek'zeer",
  background: Background,
  headshot: Headshot,
  icon: 'achievement_raid_mantidraid07',
  fight: {
    timeline: {
      abilities: [
        {
          id: 124849, // Consuming Terror
          type: 'cast',
        },
        {
          id: 123255, // Dissonance Field
          type: 'cast',
        },
      ],
      debuffs: [
        {
          id: 124849, // Consuming Terror (feared)
        },
        {
          id: 123845, // Heart of Fear
        },
        {
          id: 124097, // Sticky Resin
        },
        {
          id: 123713, // Servant of the Empress (charmed)
        },
      ],
    },
  },
};

export default GrandEmpressShekzeer;
