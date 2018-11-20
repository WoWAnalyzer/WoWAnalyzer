import PETS from './PETS';

export const isPermanentPet = guid => guid.toString().length > 6;
export const isWildImp = guid => guid === PETS.WILD_IMP_HOG.guid || guid === PETS.WILD_IMP_INNER_DEMONS.guid;
