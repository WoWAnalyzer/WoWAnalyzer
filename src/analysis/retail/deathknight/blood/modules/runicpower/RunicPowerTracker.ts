import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class RunicPowerTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  totalCooldownReduction = 0;
  totalCooldownReductionWasted = 0;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.RUNIC_POWER;
  }

  getReducedCost(event: CastEvent) {
    const resourceCost = this.getResource(event)?.cost;
    if (!resourceCost) {
      return 0;
    }
    let cost = resourceCost / 10;
    const abilityId = event.ability.guid;
    if (abilityId === talents.DEATH_STRIKE_TALENT.id) {
      this.reduceCooldown(cost); //Red Thirst does not care about cost reduction
      if (this.selectedCombatant.hasBuff(SPELLS.OSSUARY.id)) {
        cost -= 5;
      }
    }
    return cost;
  }

  reduceCooldown(cost: number) {
    if (!this.selectedCombatant.hasTalent(SPELLS.RED_THIRST_TALENT.id)) {
      return;
    }
    const COOLDOWN_REDUCTION_MS = 100;
    const reduction = cost * COOLDOWN_REDUCTION_MS;
    if (!this.spellUsable.isOnCooldown(SPELLS.VAMPIRIC_BLOOD.id)) {
      this.totalCooldownReductionWasted += reduction;
    } else {
      const effectiveReduction = this.spellUsable.reduceCooldown(
        SPELLS.VAMPIRIC_BLOOD.id,
        reduction,
      );
      this.totalCooldownReduction += effectiveReduction;
      this.totalCooldownReductionWasted += reduction - effectiveReduction;
    }
  }

  get cooldownReduction() {
    return this.totalCooldownReduction;
  }

  get cooldownReductionWasted() {
    return this.totalCooldownReductionWasted;
  }
}

export default RunicPowerTracker;
