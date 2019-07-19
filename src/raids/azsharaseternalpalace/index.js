export default {
  name: 'Azshara\'s Eternal Palace', // T24
  background: undefined, // TODO: Set up
  bosses: {
    AbyssalCommanderSivara: require('./AbyssalCommanderSivara').default, // 1
    BlackwaterBehemoth: require('./BlackwaterBehemoth').default, // 2
    RadianceOfAzshara: require('./RadianceOfAzshara').default, // 3
    LadyAshvane: require('./LadyAshvane').default, // 4
    Orgozoa: require('./Orgozoa').default, // 5
    TheQueensCourt: require('./TheQueensCourt').default, // 6
    ZaqulHarbringerOfNyalotha: require('./ZaqulHarbringerOfNyalotha').default, // 7
    QueenAzshara: require('./QueenAzshara').default, // 8
  },
};
