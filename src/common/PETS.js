import indexById from './indexById';

// courtesy of @wopr on WoWAnalyzer Discord

const PETS = {
  WILDIMP_ON_DREADSTALKER: {
    id: 99737,
    name: 'Wild Imp riding Dreadstalker',
  },
  GRIMIORE_FELGUARD: {
    id: 17252,
    name: 'Grimoire: Felguard',
  },
  WILDIMP: {
    id: 55659,
    name: 'Wild Imp',
  },
  DREADSTALKER: {
    id: 98035,
    name: 'Dreadstalker',
  },
  DOOMGUARD: {
    id: 11859,
    name: 'Doomguard',
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
};

export default indexById(PETS);
