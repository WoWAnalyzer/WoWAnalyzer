/* eslint-disable @typescript-eslint/no-var-requires */
import Ulduar from './images/Ulduar.jpg';

export default {
  name: 'Ulduar', // T8
  background: Ulduar,
  bosses: {
    FlameLeviathan: require('./FlameLeviathan').default, // 1
    Ignis: require('./Ignis').default, // 2
    Razorscale: require('./Razorscale').default, // 3
    XT002: require('./XT002').default, // 4
    IronCouncil: require('./IronCouncil').default, // 5
    Kologarn: require('./Kologarn').default, // 6
    Auriaya: require('./Auriaya').default, // 7
    Hodir: require('./Hodir').default, // 8
    Thorim: require('./Thorim').default, // 9
    Freya: require('./Freya').default, // 10
    Mimiron: require('./Mimiron').default, // 11
    GeneralVezax: require('./GeneralVezax').default, // 12
    YoggSaron: require('./YoggSaron').default, // 13
    Algalon: require('./Algalon').default, // 14
  },
};
