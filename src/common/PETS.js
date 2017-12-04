import indexById from './indexById';

// courtesy of @wopr on WoWAnalyzer Discord

const PETS = {
  WILDIMP_ON_DREADSTALKER: {
    id: 99737,
    name: 'Wild Imp riding Dreadstalker',
    baseDuration: 12,
  },
  GRIMOIRE_FELGUARD: {
    id: 17252,
    name: 'Grimoire: Felguard',
    baseDuration: 25,
  },
  WILDIMP: {
    id: 55659,
    name: 'Wild Imp',
    baseDuration: 12,
  },
  DREADSTALKER: {
    id: 98035,
    name: 'Dreadstalker',
    baseDuration: 12,
  },
  DOOMGUARD: {
    id: 11859,
    name: 'Doomguard',
    baseDuration: 25,
  },
  INFERNAL: {
    id: 89,
    name: 'Infernal',
    baseDuration: 25,
  },
  DARKGLARE: {
    id: 103673,
    name: 'Darkglare',
    baseDuration: 12,
  },

  // priest:
  SHADOWFIEND: {
    id: 19668,
    name: 'Shadowfiend',
  },
  SHADOWFIEND_SHA_GLYPH: {
    id: 67235,
    name: 'Shadowfiend',
  },
  MINDBENDER: {
    id: 62982,
    name: 'Mindbender',
  },
  VOID_TENDRIL: {
    id: 98167,
    name: 'Void Tendril',
  },

  //hunter:
  HATI: {
    id: 100324,
    name: 'Hati',
  },
  HATI_2: {
    id: 106551,
    name: 'Hati',
  },
  HATI_3: {
    id: 106550,
    name: 'Hati',
  },
  HATI_4: {
    id: 106548,
    name: 'Hati',
  },
  HATI_5: {
    id: 106549,
    name: 'Hati',
  },
  HATI_6: {
    id: 103154,
    name: 'Hati',
  },
  HATI_7: {
    id: 121181,
    name: 'Hati',
  },
  CALL_PET_1: {
    id: 883,
    name: 'Call Pet 1',
  },
  CALL_PET_2: {
    id: 83242,
    name: 'Call Pet 2',
  },
  CALL_PET_3: {
    id: 83243,
    name: 'Call Pet 3',
  },
  CALL_PET_4: {
    id: 83244,
    name: 'Call Pet 4',
  },
  CALL_PET_5: {
    id: 83245,
    name: 'Call Pet 5',
  },
  SNEAKY_SNAKE: {
    id: 121661,
    name: 'Sneaky Snake',
  },
};

export default indexById(PETS);
