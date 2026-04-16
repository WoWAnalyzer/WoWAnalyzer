import CombatLogParser from './CombatLogParser';
import Entity from './Entity';
import Unit from './Unit';

interface PetFight {
  id: number;
  instances: number;
}

export interface PetInfo extends Unit {
  petOwner: number;
  fights: PetFight[];
}

class Pet extends Entity {
  private readonly baseInfo: PetInfo;

  override get name() {
    return this.baseInfo.name;
  }

  get type() {
    return this.baseInfo.type;
  }

  get guid() {
    return this.baseInfo.guid;
  }

  constructor(owner: CombatLogParser, baseInfo: PetInfo) {
    super(owner);
    this.baseInfo = baseInfo;
  }
}

export default Pet;
