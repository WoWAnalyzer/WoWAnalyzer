import Potion from 'parser/retail/modules/items/Potion';

const HEALTH_STONE_IDS = [
  47877, // Master Healthstone
  47875, // Master Healthstone
  47876, // Master Healthstone
  47872, // Master Healthstone
  47873, // Master Healthstone
  47874, // Master Healthstone
  27235, // Master Healthstone
  27236, // Master Healthstone
  27237, // Master Healthstone
];

class HealthstoneChecker extends Potion {
  static spells = HEALTH_STONE_IDS;
  static extraAbilityInfo = {
    name: 'Healthstone',
  };
}

export default HealthstoneChecker;
