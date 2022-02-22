/* eslint-disable @typescript-eslint/no-var-requires */
import MagtheridonsLair from './images/backgrounds/MagtheridonsLair.jpg';

export default {
  name: "Magtheridon's Lair", // T4
  background: MagtheridonsLair,
  bosses: {
    Magtheridon: require('./Magtheridon').default, // 1
  },
};
