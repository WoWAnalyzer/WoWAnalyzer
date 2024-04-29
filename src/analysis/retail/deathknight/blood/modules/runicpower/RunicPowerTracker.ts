import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

// Vamp blood CDR per 10 RP spent by # of talent points taken
const RED_THIRST_REDUCTION_MS: Record<number, number> = { 1: 1000, 2: 2000 };

class RunicPowerTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  rpSpent = 0;
  totalCooldownReduction = 0;
  totalCooldownReductionWasted = 0;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.RUNIC_POWER;
  }

  getAdjustedCost(event: CastEvent) {
    const resourceCost = this.getResource(event)?.cost;
    if (!resourceCost) {
      return 0;
    }
    let cost = resourceCost / 10;
    // Handle Red Thirst
    this.reduceCooldown(cost);

    const abilityId = event.ability.guid;
    if (
      abilityId === TALENTS.DEATH_STRIKE_TALENT.id &&
      this.selectedCombatant.hasBuff(SPELLS.OSSUARY_TALENT_BUFF.id)
    ) {
      cost -= 5;
    }
    return cost;
  }

  reduceCooldown(cost: number) {
    if (!this.selectedCombatant.hasTalent(TALENTS.RED_THIRST_TALENT)) {
      return;
    }

    const rank = this.selectedCombatant.getTalentRank(TALENTS.RED_THIRST_TALENT);
    const COOLDOWN_REDUCTION_MS = RED_THIRST_REDUCTION_MS[rank];
    this.rpSpent += cost;

    while (this.rpSpent > 10) {
      this.rpSpent -= 10;
      const reduction = COOLDOWN_REDUCTION_MS;
      if (!this.spellUsable.isOnCooldown(TALENTS.VAMPIRIC_BLOOD_TALENT.id)) {
        this.totalCooldownReductionWasted += reduction;
      } else {
        const effectiveReduction = this.spellUsable.reduceCooldown(
          TALENTS.VAMPIRIC_BLOOD_TALENT.id,
          reduction,
        );
        this.totalCooldownReduction += effectiveReduction;
        this.totalCooldownReductionWasted += reduction - effectiveReduction;
      }
    }
  }

  get cooldownReduction() {
    return this.totalCooldownReduction;
  }

  get cooldownReductionWasted() {
    return this.totalCooldownReductionWasted;
  }

  get wastePerformance(): QualitativePerformance {
    if (this.percentWasted < 0.02) {
      return QualitativePerformance.Perfect;
    } else if (this.percentWasted < 0.05) {
      return QualitativePerformance.Good;
    } else if (this.percentWasted < 0.1) {
      return QualitativePerformance.Ok;
    } else {
      return QualitativePerformance.Fail;
    }
  }

  baseGeneratedRp(spells: Spell[]): number {
    return spells
      .map((spell) => {
        const casts = this.buildersObj[spell.id]?.casts ?? 0;
        return casts * (spell.runesCost ?? 0) * 10;
      })
      .reduce((a, b) => a + b, 0);
  }

  generatedRp(spells: Spell[]): number {
    return spells
      .map((spell) => {
        return this.buildersObj[spell.id]?.generated ?? 0;
      })
      .reduce((a, b) => a + b, 0);
  }

  wastedRp(spells: Spell[]): number {
    return spells
      .map((spell) => {
        return this.buildersObj[spell.id]?.wasted ?? 0;
      })
      .reduce((a, b) => a + b, 0);
  }

  bonusGeneratedRp(spells: Spell[]): number {
    const base = this.baseGeneratedRp(spells);
    const actual = this.generatedRp(spells) + this.wastedRp(spells);
    return actual - base;
  }

  estRunesSpent(spells: Spell[]): number {
    return spells
      .map((spell) => {
        const casts = this.buildersObj[spell.id]?.casts ?? 0;
        return casts * (spell.runesCost ?? 0);
      })
      .reduce((a, b) => a + b, 0);
  }
}

export default RunicPowerTracker;
