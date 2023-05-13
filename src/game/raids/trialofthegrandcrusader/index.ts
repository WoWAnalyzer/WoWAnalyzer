/* eslint-disable @typescript-eslint/no-var-requires */

export default {
  name: 'Trial of the Grand Crusader', // T9
  bosses: {
    NorthrendBeasts: require('./NorthrendBeasts').default, // 1
    LordJaraxxus: require('./LordJaraxxus').default, // 2
    FactionChampions: require('./FactionChampions').default, // 3
    ValkyrTwins: require('./ValkyrTwins').default, // 4
    Anubarak: require('./Anubarak').default, // 5
  },
};
