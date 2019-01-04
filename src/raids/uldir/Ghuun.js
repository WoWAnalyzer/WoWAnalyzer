import Background from './images/Backgrounds/Ghuun.jpg';
import Headshot from './images/Headshots/Ghuun.png';

export default {
  id: 2122,
  name: 'G\'huun',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_ghuun',
  fight: {
    //vantusRuneBuffId: 250144,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      physical: [
        267412, //Massive Smash
      ],
      magical: [],
    },
    phases: [
      {
        id: 1,
        name: 'Stage One: My Minions Are Endless!',
      },
      {
        id: 2,
        name: 'Stage Two: Behold the Power of Ghuun!',
        filter: {
          type: 'removedebuff',
          ability: {
            id: 263504,
          },
          eventInstance: 0,
        },
      },
      {
        id: 3,
        name: 'Stage Three: Your Destruction is Assured!',
        filter: {
          type: 'applybuff',
          ability: {
            id: 276839,
          },
        },
      },
    ],
  },
};
