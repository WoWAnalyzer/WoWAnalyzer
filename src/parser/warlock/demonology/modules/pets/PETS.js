import SPELLS from 'common/SPELLS';

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
    summonAbility: SPELLS.WILD_IMP_HOG_SUMMON.id,
  },
  DREADSTALKER: {
    guid: 98035,
    duration: 12000,
    summonAbility: SPELLS.DREADSTALKER_SUMMON_1.id,
  },
  VILEFIEND: {
    guid: 135816,
    duration: 15000,
    summonAbility: SPELLS.SUMMON_VILEFIEND_TALENT.id,
  },
  GRIMOIRE_FELGUARD: {
    guid: 17252,
    duration: 15000,
    summonAbility: SPELLS.GRIMOIRE_FELGUARD_TALENT.id,
  },
  DEMONIC_TYRANT: {
    guid: 135002,
    duration: 15000,
    summonAbility: SPELLS.SUMMON_DEMONIC_TYRANT.id,
  },
  // Inner Demons and Nether Portal demons
  WILD_IMP_INNER_DEMONS: {
    guid: 143622,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.WILD_IMP_ID_SUMMON.id,
  },
  BILESCOURGE: {
    guid: 136404,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.BILESCOURGE_SUMMON.id,
    isRandom: true,
  },
  VICIOUS_HELLHOUND: {
    guid: 136399,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.VICIOUS_HELLHOUND_SUMMON.id,
    isRandom: true,
  },
  SHIVARRA: {
    guid: 136406,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.SHIVARRA_SUMMON.id,
    isRandom: true,
  },
  DARKHOUND: {
    guid: 136408,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.DARKHOUND_SUMMON.id,
    isRandom: true,
  },
  ILLIDARI_SATYR: {
    guid: 136398,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.ILLIDARI_SATYR_SUMMON.id,
    isRandom: true,
  },
  VOID_TERROR: {
    guid: 136403,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.VOID_TERROR_SUMMON.id,
    isRandom: true,
  },
  URZUL: {
    guid: 136402,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.URZUL_SUMMON.id,
    isRandom: true,
  },
  WRATHGUARD: {
    guid: 136407,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.WRATHGUARD_SUMMON.id,
    isRandom: true,
  },
  EYE_OF_GULDAN: {
    guid: 136401,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.EYE_OF_GULDAN_SUMMON.id,
    isRandom: true,
  },
  PRINCE_MALCHEZAAR: {
    guid: 136397,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.PRINCE_MALCHEZAAR_SUMMON.id,
    isRandom: true,
  },
};

export default indexByGuid(PETS);
