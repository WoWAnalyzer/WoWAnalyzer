import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker, { TrackedAbility } from 'parser/shared/modules/AbilityTracker';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';

class Overhealing extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    healingDone: HealingDone,
  };

  protected abilityTracker!: AbilityTracker;

  divinePurposeActive = this.selectedCombatant.hasTalent(TALENTS.DIVINE_PURPOSE_SHARED_TALENT);

  getRawHealing(ability: TrackedAbility) {
    return ability.healingVal.raw;
  }
  getOverhealingPercentage(spellId: number) {
    const ability = this.abilityTracker.getAbility(spellId);
    return ability.healingVal.overheal / this.getRawHealing(ability);
  }

  get lightOfDawnOverhealing() {
    return this.getOverhealingPercentage(SPELLS.LIGHT_OF_DAWN_HEAL.id);
  }
  get lightOfDawnSuggestionThresholds() {
    const base = this.divinePurposeActive ? 0.45 : 0.4;
    return {
      actual: this.lightOfDawnOverhealing,
      isGreaterThan: {
        minor: base,
        average: base + 0.1,
        major: base + 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  get holyShockOverhealing() {
    return this.getOverhealingPercentage(SPELLS.HOLY_SHOCK_HEAL.id);
  }
  get holyShockSuggestionThresholds() {
    const base = this.divinePurposeActive ? 0.4 : 0.35;
    return {
      actual: this.holyShockOverhealing,
      isGreaterThan: {
        minor: base,
        average: base + 0.1,
        major: base + 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  get flashOfLightOverhealing() {
    return this.getOverhealingPercentage(SPELLS.FLASH_OF_LIGHT.id);
  }
  get flashOfLightSuggestionThresholds() {
    return {
      actual: this.flashOfLightOverhealing,
      isGreaterThan: {
        minor: 0.25,
        average: 0.4,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default Overhealing;
