import Background from './images/Backgrounds/Zul.jpg';
import Headshot from './images/Headshots/Zul.png';

export default {
  id: 2145,
  name: 'Zul',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_zul',
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
        name: 'Stage One: The Forces of Blood',
      },
      {
        id: 2,
        name: 'Stage Two: Zul, Awakened',
        filter: {
          type: 'begincast',
          ability: {
            id: 274168,
          },
        },
      },
    ],
  },
};
