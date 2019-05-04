import Background from './images/backgrounds/UunatHarbingerOfTheVoid.jpg';
import Headshot from './images/headshots/UunatHarbingerOfTheVoid.png';

export default {
  id: 2273,
  name: 'Uu\'nat, Harbinger of the Void',
  background: Background,
  headshot: Headshot,
  icon: 'achievement_uunat',
  fight: {
    vantusruneBuffId: 285901,
    softMitigationChecks: {
      physical: [],
      magical: [
        284851, // Touch of the End
      ],
    },
  },
};
