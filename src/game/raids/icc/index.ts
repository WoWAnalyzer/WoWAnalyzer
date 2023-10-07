/* eslint-disable @typescript-eslint/no-var-requires */

export default {
  name: 'Icecrown Citadel',
  bosses: {
    Marrowgar: require('./Marrowgar').default,
    Deathwhisper: require('./Deathwhisper').default,
    Gunship: require('./Gunship').default,
    Saurfang: require('./Saurfang').default,
    Festergut: require('./Festergut').default,
    Rotface: require('./Rotface').default,
    Putricide: require('./Putricide').default,
    BloodCouncil: require('./BloodCouncil').default,
    BloodQueen: require('./BloodQueen').default,
    Dreamwalker: require('./Dreamwalker').default,
    Sindragosa: require('./Sindragosa').default,
    LichKing: require('./LichKing').default,
  },
};
