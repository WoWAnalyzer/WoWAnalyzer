import BaseHealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';

class HealingEfficiencyTracker extends BaseHealingEfficiencyTracker {
  getCustomSpellStats(spellInfo: any, spellId: number, healingSpellIds: number[]) {
    return spellInfo;
  }
}

export default HealingEfficiencyTracker;
