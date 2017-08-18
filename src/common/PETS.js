import indexById from './indexById';

//courtesy of @shighman / @wopr on WoWAnalyzer Discord

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
};

export default indexById(PETS);
