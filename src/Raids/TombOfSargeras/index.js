export default {
  // https://worldofwarcraft.com/en-gb/news/20783382/raid-preview-tomb-of-sargeras
  name: 'Tomb of Sargeras',
  background: require('./Images/Backgrounds/tomb.jpg').default,
  bosses: {
    Goroth: require('./Goroth').default,
    DemonicInquisition: require('./DemonicInquisition').default,
    Harjatan: require('./Harjatan').default,
    MistressSasszine: require('./MistressSasszine').default,
    SistersOfTheMoon: require('./SistersOfTheMoon').default,
    TheDesolateHost: require('./TheDesolateHost').default,
    MaidenOfVigilance: require('./MaidenOfVigilance').default,
    FallenAvatar: require('./FallenAvatar').default,
    Kiljaeden: require('./Kiljaeden').default,
  },
};
