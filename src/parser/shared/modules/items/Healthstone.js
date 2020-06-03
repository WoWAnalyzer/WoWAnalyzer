import SPELLS from 'common/SPELLS/index';

import Combatants from 'parser/shared/modules/Combatants';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { Class } from 'parser/core/Events';
import Potion from './Potion';
/**
 * Tracks Healthstone cooldown.
 */
class Healthstone extends Potion {
  // Potion does not use Combatants, other dependencies are inherit from Potion.
  static dependencies = {
    abilities: Abilities,
    buffs: Buffs,
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
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
    return players.find(combatant => (combatant.spec.className === Class.Warlock));
  }
}

export default Healthstone;
