import { isPermanentPet } from 'parser/shared/modules/pets/helpers';

import PETS from './PETS';

export const isWildImp = (guid: number) =>
  guid === PETS.WILD_IMP_HOG.guid || guid === PETS.WILD_IMP_INNER_DEMONS.guid;
export const isWarlockPet = (guid: number) => isPermanentPet(guid) || Boolean(PETS[guid]);
export const isRandomPet = (guid: number) =>
  isWarlockPet(guid) && !isPermanentPet(guid) && PETS[guid].isRandom;
