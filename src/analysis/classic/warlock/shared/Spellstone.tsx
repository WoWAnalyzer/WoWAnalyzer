import SPELLS from 'common/SPELLS/classic/warlock';
import Analyzer, { Options } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';

const STAT_MODIFIER = 60;

class Spellstone extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;

  constructor(options: Options) {
    super(options);

    const combatant = this.selectedCombatant;
    const weapon = combatant._getGearItemBySlotId(15);

    this.active = weapon.temporaryEnchant === 3620;
    if (!this.active) {
      return;
    }

    const localStatTracker: StatTracker = options.statTracker as StatTracker;
    localStatTracker.add(SPELLS.SPELLSTONE_USE.id, {
      haste: this.bonusHasteGain(localStatTracker),
    });
  }

  bonusHasteGain(statTracker: StatTracker) {
    return statTracker.startingHasteRating + STAT_MODIFIER;
  }
}

export default Spellstone;
