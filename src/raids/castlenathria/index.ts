import CastleNathria from './images/backgrounds/CastleNathria.jpg';

export default {
  name: 'Castle Nathria', // T26
  background: CastleNathria, // TODO: Set up
  bosses: {
    Shriekwing: require('./Shriekwing').default, // 1
    HuntsmanAltimor: require('./HuntsmanAltimor').default, // 2
    SunKingsSalvation: require('./SunKingsSalvation').default, // 3
    ArtificerXymox: require('./ArtificerXymox').default, // 4
    HungeringDestroyer: require('./HungeringDestroyer').default, // 5
    LadyInervaDarkvein: require('./LadyInervaDarkvein').default, // 6
    TheCouncilOfBlood: require('./TheCouncilOfBlood').default, // 7
    Sludgefist: require('./Sludgefist').default, // 8
    StoneLegionGenerals: require('./StoneLegionGenerals').default, // 9
    SireDenathrius: require('./SireDenathrius').default, // 10
  },
};
