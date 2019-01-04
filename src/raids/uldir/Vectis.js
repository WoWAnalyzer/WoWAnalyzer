import Background from './images/Backgrounds/Vectis.jpg';
import Headshot from './images/Headshots/Vectis.png';

export default {
  id: 2134,
  name: 'Vectis',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_bloodofghuun',
  fight: {
    //vantusRuneBuffId: 250144,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      physical: [],
      magical: [],
    },
    phases: [
      {
        id: 1,
        name: 'Stage One: Probing Its Hosts',
        filter: {
          type: 'removebuff',
          ability: {
            id: 265217,
          },
        },
      },
      {
        id: 2,
        name: 'Stage Two: Spreading Pandemic',
        filter: {
          type: 'applybuff',
          ability: {
            id: 265217,
          },
        },
      },
    ],
  },
};
