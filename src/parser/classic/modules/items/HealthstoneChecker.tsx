import Potion from 'parser/retail/modules/items/Potion';

const HEALTH_STONE_IDS = [
  6262, // Cata Healthstone
];

class HealthstoneChecker extends Potion {
  static spells = HEALTH_STONE_IDS;
  static extraAbilityInfo = {
    name: 'Healthstone',
  };
}

export default HealthstoneChecker;
