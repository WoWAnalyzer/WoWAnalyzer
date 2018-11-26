import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HealingDone from 'parser/shared/modules/HealingDone';
import DamageDone from 'parser/shared/modules/DamageDone';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import HealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import SPELLS from 'common/SPELLS/index';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';

import RegrowthAttributor from 'parser/druid/restoration/modules/core/hottracking/RegrowthAttributor';
import Abilities from 'parser/druid/restoration/modules/Abilities';
import Clearcasting from 'parser/druid/restoration/modules/features/Clearcasting';

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
    regrowthAttributor: RegrowthAttributor,
    clearcasting: Clearcasting,
  };

  getCustomSpellStats(spellInfo, spellId) {
    // If we have a spell that has custom logic for the healing/damage numbers, do that before the rest of our calculations.
    if (spellId === SPELLS.REGROWTH.id) {
      spellInfo = this.getRegrowthDetails(spellInfo);
    }

    return spellInfo;
  }

  getRegrowthDetails(spellInfo) {
    // This represents that amount of healing done by HARD CASTING regrowth.
    // We don't want regrowth to get Hpm credit for healing that we didn't spend mana on.
    spellInfo.healingDone = this.regrowthAttributor.totalNonCCRegrowthHealing;
    spellInfo.overhealingDone = this.regrowthAttributor.totalNonCCRegrowthOverhealing;
    spellInfo.healingAbsorbed = this.regrowthAttributor.totalNonCCRegrowthAbsorbs;
    spellInfo.casts = this.clearcasting.nonCCRegrowths;
    spellInfo.hits = this.regrowthAttributor.totalNonCCRegrowthHealingTicks;

    return spellInfo;
  }
}

export default RestoDruidHealingEfficiencyTracker;
