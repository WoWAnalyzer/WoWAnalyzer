export default {
  name: 'Dungeons',
  background: undefined, // TODO: Set up
  bosses: {
    DeOtherSide: require('./DeOtherSide').default,
    HallsOfAtonement: require('./HallsOfAtonement').default,
    MistsOfTirnaScithe: require('./MistsOfTirnaScithe').default,
    Plaguefall: require('./Plaguefall').default,
    SanguineDepths: require('./SanguineDepths').default,
    SpiresOfAscension: require('./SpiresOfAscension').default,
    TheaterOfPain: require('./TheaterOfPain').default,
    TheNecroticWake: require('./TheNecroticWake').default,
  },
};
