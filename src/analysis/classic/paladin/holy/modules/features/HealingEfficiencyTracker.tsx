import BaseHealingEfficiencyTracker, {
  SpellInfoDetails,
} from 'parser/core/healingEfficiency/HealingEfficiencyTracker';

class HealingEfficiencyTracker extends BaseHealingEfficiencyTracker {
  getCustomSpellStats(spellInfo: SpellInfoDetails, spellId: number, healingSpellIds: number[]) {
    return spellInfo;
  }
}

export default HealingEfficiencyTracker;
