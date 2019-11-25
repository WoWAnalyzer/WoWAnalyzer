export default {
  name: 'Dungeons',
  background: undefined, // TODO: Set up
  bosses: {
    AtalDazar: require('./AtalDazar').default,
    Freehold: require('./Freehold').default,
    KingsRest: require('./KingsRest').default,
    ShrineOfTheStorm: require('./ShrineOfTheStorm').default,
    SiegeOfBoralus: require('./SiegeOfBoralus').default,
    TempleOfSethraliss: require('./TempleOfSethraliss').default,
    TheMotherlode: require('./TheMotherlode').default,
    TheUnderrot: require('./TheUnderrot').default,
    TolDagor: require('./TolDagor').default,
    WaycrestManor: require('./WaycrestManor').default,
  },
};
