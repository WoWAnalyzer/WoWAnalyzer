import CombatLogParser from './CombatLogParser';
import Entity from './Entity';
import Unit from './Unit';

export interface PetFight {
  id: number;
  instances: number;
}

export interface PetInfo extends Unit {
  petOwner: number;
  fights: PetFight[];
}

class Pet extends Entity {
  get name() {
    return this._baseInfo.name;
  }

  get type() {
    return this._baseInfo.type;
  }

  get guid() {
    return this._baseInfo.guid;
  }

  _baseInfo: PetInfo;

  constructor(owner: CombatLogParser, baseInfo: PetInfo) {
    super(owner);
    this._baseInfo = baseInfo;
  }
}

export default Pet;
