import SPELLS from 'common/SPELLS/index';

import Combatants from 'parser/shared/modules/Combatants';
import { Class } from 'parser/core/Events';
import Potion from './Potion';
/**
 * Tracks Healthstone cooldown.
 */
class Healthstone extends Potion {
  static dependencies = {
    ...Potion.dependencies,
    combatants: Combatants,
  };

  static spells = [
    SPELLS.HEALTHSTONE,
  ];
  static recommendedEfficiency = 0;
  static extraAbilityInfo = {
    isDefensive: true,
  };

  get isAvailable() {
    const players = Object.values(this.combatants.players);
    return players.some(combatant => (combatant.spec.className === Class.Warlock));
  }
}

export default Healthstone;
