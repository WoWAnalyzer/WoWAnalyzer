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
    summonIds: [104317], // this prop might not be even used
  },
  DREADSTALKER: {
    guid: 98035,
    duration: 12000,
    summonIds: [193331, 193332],
  },
  // verified on 2 logs without Vilefiend, either I'm unlucky (and Vilefiend can be summoned from ID/NP with the same guid), but more likely is that it's the talent's Vilefiend guid
  // according to https://www.wowhead.com/spell=267217/nether-portal#comments:id=2581624 though, it can't be summoned from it?
  VILEFIEND: {
    guid: 135816,
    duration: 15000,
    summonIds: [264119],
  },
  GRIMOIRE_FELGUARD: {
    guid: 17252,
    duration: 15000,
    summonIds: [111898],
  },
  DEMONIC_TYRANT: {
    guid: 135002,
    duration: 15000,
    summonIds: [265187],
  },
  // Inner Demons and Nether Portal demons
  WILD_IMP_INNER_DEMONS: {
    guid: 143622,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION, // follows the same rules as HOG Wild Imps though
    summonIds: [279910],
  },
  BILESCOURGE: {
    guid: 136404,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonIds: [267992],
  },
  VICIOUS_HELLHOUND: {
    guid: 136399,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonIds: [267988],
  },
  SHIVARRA: {
    guid: 136406,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonIds: [267994],
  },
  DARKHOUND: {
    guid: 136408,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonIds: [267996],
  },
  ILLIDARI_SATYR: {
    guid: 136398,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonIds: [267987],
  },
  VOID_TERROR: {
    guid: 136403,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonIds: [267991],
  },
  URZUL: {
    guid: 136402,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonIds: [268001],
  },
  WRATHGUARD: {
    guid: 136407,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonIds: [267995],
  },
  EYE_OF_GULDAN: {
    guid: 136401,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonIds: [267989],
  },
  PRINCE_MALCHEZAAR: {
    guid: 136397,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonIds: [267986],
  },
};

export default indexByGuid(PETS);
