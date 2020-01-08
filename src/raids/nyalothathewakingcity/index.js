export default {
  name: 'Ny\'alotha, The Waking City', // T24
  background: undefined, // TODO: Set up
  bosses: {
    WrathionTheBlackEmperor: require('./WrathionTheBlackEmperor').default, // 1
    Maut: require('./Maut').default, // 2
    TheProphetSkitra: require('./TheProphetSkitra').default, // 3
    DarkInquisitorXanesh: require('./DarkInquisitorXanesh').default, // 4
    TheHivemind: require('./TheHivemind').default, // 5
    ShadharTheInsatiable: require('./ShadharTheInsatiable').default, // 6
    Drestagath: require('./Drestagath').default, // 7
    Vexiona: require('./Vexiona').default, // 8
    RadenTheDespoiled: require('./RadenTheDespoiled').default, // 9
    IlgynothCorruptionReborn: require('./IlgynothCorruptionReborn').default, // 10
    CarapaceOfNzoth: require('./CarapaceOfNzoth').default, // 11
    NzothTheCorruptor: require('./NzothTheCorruptor').default, // 12
  },
};
