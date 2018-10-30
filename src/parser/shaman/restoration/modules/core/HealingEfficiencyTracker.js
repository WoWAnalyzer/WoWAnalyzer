import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import DamageDone from 'parser/shared/modules/DamageDone';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Abilities from 'parser/shared/modules/Abilities';
import CoreHealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import SPELLS from 'common/SPELLS';
import HealingDone from './HealingDone';
import Resurgence from '../spells/Resurgence';
import CooldownThroughputTracker from '../features/CooldownThroughputTracker';
import UnleashLife from '../talents/UnleashLife';

class HealingEfficiencyTracker extends CoreHealingEfficiencyTracker {
  static dependencies = {
    manaTracker: ManaTracker,
    abilityTracker: AbilityTracker,
    healingDone: HealingDone,
    damageDone: DamageDone,
    castEfficiency: CastEfficiency,
    abilities: Abilities,
    resurgence: Resurgence,
    cooldownThroughputTracker: CooldownThroughputTracker,
    unleashLife: UnleashLife,
  };

  getCustomSpellStats(spellInfo, spellId) {
    // If we have a spell that has custom logic for the healing/damage numbers, do that before the rest of our calculations.
    if (this.resurgence.resurgence[spellId]) {
      spellInfo.manaSpent -= this.resurgence.resurgence[spellId].resurgenceTotal;
    }
    const feeding = (this.cooldownThroughputTracker.getIndirectHealing(spellId) || 0);
    spellInfo.healingDone += feeding; // this doesn't include healingSpellIds
    // remove feeding

    if (this.unleashLife.healingBuff[spellId]) {
      const unlc = (this.unleashLife.healingBuff[spellId].healing || 0);
      spellInfo.healingDone -= unlc;
    }
    if (spellId === SPELLS.UNLEASH_LIFE_TALENT.id) {
      const unle = this.unleashLife.totalBuffedHealing;
      spellInfo.healingDone += unle;
    }

    // add unleash extra healing thru unleash module (reworked?)
    // remove it from the original spell
    return spellInfo;
  }
}

export default HealingEfficiencyTracker;
