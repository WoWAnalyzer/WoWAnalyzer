export default {
  name: 'Battle of Dazar\'alor', // T23
  background: undefined, // TODO: Set up
  bosses: {
    // Horde
    FridaIronbellows: require('./FridaIronbellows').default, // 1
    GrongTheJungleLord: require('./GrongTheJungleLord').default, // 2
    JadefireMastersHorde: require('./JadefireMastersHorde').default, // 3
    HighTinkerMekkatorque: require('./HighTinkerMekkatorque').default, // 4
    StormwallBlockade: require('./StormwallBlockade').default, // 5
    JainaProudmoore: require('./JainaProudmoore').default, // 6
    // Alliance
    RawaniKanae: require('./RawaniKanae').default, // 1
    JadefireMastersAlliance: require('./JadefireMastersAlliance').default, // 2
    GrongTheRevenant: require('./GrongTheRevenant').default, // 3
    OpulenceTreasureGuardian: require('./OpulenceTreasureGuardian').default, // 4
    ConclaveOfTheChosen: require('./ConclaveOfTheChosen').default, // 5
    KingRastakhan: require('./KingRastakhan').default, // 6
  },
};
