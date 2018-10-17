import Background from './images/backgrounds/Argus-the-Unmaker.jpg';
import Headshot from './images/headshots/Argus-the-Unmaker.png';

export default {
  id: 2092,
  name: 'Argus the Unmaker',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_argus_worldsoul',
  fight: {
    vantusRuneBuffId: 250146,
    disableDeathSuggestion: true,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: [
      248499, // SweepingScythe
      258039, // DeadlyScythe
      258838, // SoulrendingScythe
    ],
  },
};
