/* eslint-disable @typescript-eslint/no-var-requires */
import GruulsLair from './images/GruulsLair.jpg';

export default {
  name: "Gruul's Lair", // T4
  background: GruulsLair,
  bosses: {
    HighKingMaulgar: require('./HighKingMaulgar').default, // 1
    Gruul: require('./Gruul').default, // 2
  },
};
