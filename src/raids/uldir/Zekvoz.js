import Background from './images/Backgrounds/Zekvoz.jpg';
import Headshot from './images/Headshots/Zekvoz.png';

export default {
  id: 2136,
  name: 'Zek\'voz',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_nazmir_boss_zekvoz',
  fight: {
    //vantusRuneBuffId: 250144,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      physical: [
        265237, // Shatter
      ],
      magical: [
        265264, // Void Lash
      ],
    },
    phases: [
      {
        id: 1,
        name: 'Stage One: Chaos',
      },
      {
        id: 2,
        name: 'Stage Two: Deception',
        filter: {
          type: 'cast',
          ability: {
            id: 181089,
          },
          eventInstance: 0,
        },
      },
      {
        id: 3,
        name: 'Stage Three: Corruption',
        filter: {
          type: 'cast',
          ability: {
            id: 181089,
          },
          eventInstance: 1,
        },
      },
    ],
  },
};
