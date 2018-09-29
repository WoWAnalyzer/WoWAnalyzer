import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/core/modules/ResourceTracker/ResourceTracker';
import SPELLS from 'common/SPELLS';
import SpellUsable from 'parser/core/modules/SpellUsable';

class RunicPowerTracker extends ResourceTracker {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  totalCooldownReduction = 0;
  totalCooldownReductionWasted = 0;

  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.RUNIC_POWER;
  }

  getReducedCost(event) {
    if (!this.getResource(event).cost) {
      return 0;
    }
    let cost = this.getResource(event).cost / 10;
    const abilityId = event.ability.guid;
    if (abilityId === SPELLS.DEATH_STRIKE.id) {
      this.reduceCooldown(cost); //Red Thirst does not care about cost reduction
      if (this.selectedCombatant.hasBuff(SPELLS.BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF.id) &&
        this.selectedCombatant.hasBuff(SPELLS.GRAVEWARDEN.id, event.timestamp)) {
        cost -= 5;
      }
      if (this.selectedCombatant.hasBuff(SPELLS.OSSUARY.id)) {
        cost -= 5;
      }
    }
    return cost;
  }

  reduceCooldown(cost) {
    if (!this.selectedCombatant.hasTalent(SPELLS.RED_THIRST_TALENT.id)){
      return;
    }
    const COOLDOWN_REDUCTION_MS = 1000 / 10;
    const reduction = cost * COOLDOWN_REDUCTION_MS;
    if (!this.spellUsable.isOnCooldown(SPELLS.VAMPIRIC_BLOOD.id)){
      this.totalCooldownReductionWasted += reduction;
    } else {
      const effectiveReduction = this.spellUsable.reduceCooldown(SPELLS.VAMPIRIC_BLOOD.id, reduction);
      this.totalCooldownReduction += effectiveReduction;
      this.totalCooldownReductionWasted += reduction - effectiveReduction;
    }
  }

  get cooldownReduction(){
    return this.totalCooldownReduction;
  }

  get cooldownReductionWasted(){
    return this.totalCooldownReductionWasted;
  }

}

export default RunicPowerTracker;
