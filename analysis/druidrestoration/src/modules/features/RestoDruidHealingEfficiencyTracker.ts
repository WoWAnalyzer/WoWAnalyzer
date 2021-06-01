import SPELLS from 'common/SPELLS';
import HealingEfficiencyTracker, {
  SpellInfoDetails,
} from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';

import Abilities from '../Abilities';
import RegrowthAndClearcasting from '../features/RegrowthAndClearcasting';

/*
    TODO:
      * Some spells contain multiple healIds, create a graphical breakdown
      * Factor in mastery healing
      * Add more descriptions
 */
class RestoDruidHealingEfficiencyTracker extends HealingEfficiencyTracker {
  static dependencies = {
    manaTracker: ManaTracker,
    abilityTracker: AbilityTracker,
    healingDone: HealingDone,
    damageDone: DamageDone,
    castEfficiency: CastEfficiency,

    // Custom dependencies
    abilities: Abilities,
    clearcasting: RegrowthAndClearcasting,
  };

  protected manaTracker!: ManaTracker;
  protected abilityTracker!: AbilityTracker;
  protected healingDone!: HealingDone;
  protected damageDone!: DamageDone;
  protected castEfficiency!: CastEfficiency;

  // Custom dependencies
  protected abilities!: Abilities;
  protected clearcasting!: RegrowthAndClearcasting;

  getCustomSpellStats(spellInfo: SpellInfoDetails, spellId: number) {
    // If we have a spell that has custom logic for the healing/damage numbers, do that before the rest of our calculations.
    if (spellId === SPELLS.REGROWTH.id) {
      spellInfo = this.getRegrowthDetails(spellInfo);
    }

    return spellInfo;
  }

  getRegrowthDetails(spellInfo: SpellInfoDetails) {
    // TODO special handling of Regrowth HPM with regard to free casts?
    return spellInfo;
  }
}

export default RestoDruidHealingEfficiencyTracker;
