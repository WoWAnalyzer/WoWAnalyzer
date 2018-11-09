const INNER_DEMON_NETHER_PORTAL_DURATION = 15000;

const indexByGuid = obj => {
  Object.keys(obj).forEach(key => {
    const pet = obj[key];
    obj[pet.guid] = pet;
  });
  return obj;
};

const PETS = {
  WILD_IMP_HOG: {
    guid: 55659,
    duration: 15000, // maximum duration, realistically is handled differently
  },
  DREADSTALKER: {
    guid: 98035,
    duration: 12000,
  },
  // verified on 2 logs without Vilefiend, either I'm unlucky (and Vilefiend can be summoned from ID/NP with the same guid), but more likely is that it's the talent's Vilefiend guid
  // according to https://www.wowhead.com/spell=267217/nether-portal#comments:id=2581624 though, it can't be summoned from it?
  VILEFIEND: {
    guid: 135816,
    duration: 15000,
  },
  GRIMOIRE_FELGUARD: {
    guid: 17252,
    duration: 15000,
  },
  DEMONIC_TYRANT: {
    guid: 135002,
    duration: 15000,
  },
  // Inner Demons and Nether Portal demons
  WILD_IMP_INNER_DEMONS: {
    guid: 143622,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION, // follows the same rules as HOG Wild Imps though
  },
  BILESCOURGE: {
    guid: 136404,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
  },
  VICIOUS_HELLHOUND: {
    guid: 136399,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
  },
  SHIVARRA: {
    guid: 136406,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
  },
  DARKHOUND: {
    guid: 136408,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
  },
  ILLIDARI_SATYR: {
    guid: 136398,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
  },
  VOID_TERROR: {
    guid: 136403,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
  },
  URZUL: {
    guid: 136402,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
  },
  WRATHGUARD: {
    guid: 136407,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
  },
  EYE_OF_GULDAN: {
    guid: 136401,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
  },
  PRINCE_MALCHEZAAR: {
    guid: 136397,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
  },
};

export default indexByGuid(PETS);
