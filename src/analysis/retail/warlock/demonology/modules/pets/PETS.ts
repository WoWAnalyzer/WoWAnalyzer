import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { Talent } from 'common/TALENTS/types';
import TALENTS from 'common/TALENTS/warlock';

const INNER_DEMON_NETHER_PORTAL_DURATION = 15000;

type PetRecord = {
  guid: number;
  duration: number;
  summonAbility: Spell | Talent;
  isRandom?: boolean;
};

const indexByGuid = (obj: Record<string, PetRecord>) => {
  Object.keys(obj).forEach((key) => {
    const pet = obj[key];
    obj[pet.guid] = pet;
  });
  return obj;
};

const PETS = {
  WILD_IMP_HOG: {
    guid: 55659,
    duration: 15000, // maximum duration, realistically is handled differently
    summonAbility: SPELLS.WILD_IMP_HOG_SUMMON,
  },
  DREADSTALKER: {
    guid: 98035,
    duration: 12000,
    summonAbility: SPELLS.DREADSTALKER_SUMMON_1,
  },
  VILEFIEND: {
    guid: 135816,
    duration: 15000,
    summonAbility: TALENTS.SUMMON_VILEFIEND_TALENT,
  },
  CHARHOUND: {
    guid: 226269,
    duration: 15000,
    summonAbility: SPELLS.CHARHOUND_SUMMON,
  },
  GLOOMHOUND: {
    guid: 226268,
    duration: 15000,
    summonAbility: SPELLS.GLOOMHOUND_SUMMON,
  },
  GRIMOIRE_FELGUARD: {
    guid: 17252,
    duration: 15000,
    summonAbility: TALENTS.GRIMOIRE_FELGUARD_TALENT,
  },
  DEMONIC_TYRANT: {
    guid: 135002,
    duration: 15000,
    summonAbility: SPELLS.SUMMON_DEMONIC_TYRANT,
  },
  // Inner Demons and Nether Portal demons
  WILD_IMP_INNER_DEMONS: {
    guid: 143622,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.WILD_IMP_ID_SUMMON,
  },
  BILESCOURGE: {
    guid: 136404,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.BILESCOURGE_SUMMON,
    isRandom: true,
  },
  VICIOUS_HELLHOUND: {
    guid: 136399,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.VICIOUS_HELLHOUND_SUMMON,
    isRandom: true,
  },
  SHIVARRA: {
    guid: 136406,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.SHIVARRA_SUMMON,
    isRandom: true,
  },
  DARKHOUND: {
    guid: 136408,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.DARKHOUND_SUMMON,
    isRandom: true,
  },
  ILLIDARI_SATYR: {
    guid: 136398,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.ILLIDARI_SATYR_SUMMON,
    isRandom: true,
  },
  VOID_TERROR: {
    guid: 136403,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.VOID_TERROR_SUMMON,
    isRandom: true,
  },
  URZUL: {
    guid: 136402,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.URZUL_SUMMON,
    isRandom: true,
  },
  WRATHGUARD: {
    guid: 136407,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.WRATHGUARD_SUMMON,
    isRandom: true,
  },
  EYE_OF_GULDAN: {
    guid: 136401,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.EYE_OF_GULDAN_SUMMON,
    isRandom: true,
  },
  PRINCE_MALCHEZAAR: {
    guid: 136397,
    duration: INNER_DEMON_NETHER_PORTAL_DURATION,
    summonAbility: SPELLS.PRINCE_MALCHEZAAR_SUMMON,
    isRandom: true,
  },
  MOTHER_OF_CHAOS: {
    guid: 428565,
    duration: 8000,
    summonAbility: SPELLS.MOTHER_OF_CHAOS_SUMMON,
  },
  PIT_LORD: {
    guid: 434400,
    duration: 8000,
    summonAbility: SPELLS.PIT_LORD_SUMMON,
  },
  OVERLORD: {
    guid: 428571,
    duration: 8000,
    summonAbility: SPELLS.OVERLORD_SUMMON,
  },
};

export default indexByGuid(PETS);
