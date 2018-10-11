import Background from './images/backgrounds/Imonar-the-Soulhunter.jpg';
import Headshot from './images/headshots/Imonar-the-Soulhunter.png';

export default {
  id: 2082,
  name: 'Imonar the Soulhunter',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_boss_argus_bountyhunter',
  fight: {
    vantusRuneBuffId: 250158,
    // TODO: Add fight specific props
    // e.g. baseDowntime (seconds, percentage, based on (de)buff, etc)
    // e.g. ads
    softMitigationChecks: {
      ShockLance: 247367,
      Sever: 247687,
      EmpoweredShockLance: 250255,
    },
  },
};
