export default {
  // https://worldofwarcraft.com/en-gb/news/21245598/raid-preview-antorus-the-burning-throne
  name: 'Antorus, the Burning Throne',
  background: require('./Images/antorus.jpg').default,
  bosses: {
    GarothiWorldbreaker: require('./GarothiWorldbreaker').default,
    FelhoundsOfSargeras: require('./FelhoundsOfSargeras').default,
    AntoranHighCommand: require('./AntoranHighCommand').default,
    PortalKeeperHasabel: require('./PortalKeeperHasabel').default,
    EonarLifebinder: require('./EonarLifebinder').default,
    ImonarTheSoulhunter: require('./ImonarTheSoulhunter').default,
    Kingaroth: require('./Kingaroth').default,
    TheCovenOfShivarra: require('./TheCovenOfShivarra').default,
    Varimathras: require('./Varimathras').default,
    Aggramar: require('./Aggramar').default,
    ArgusTheUnmaker: require('./ArgusTheUnmaker').default,
  },
};
