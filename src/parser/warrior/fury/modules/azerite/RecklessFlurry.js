import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import SPELLS from 'common/SPELLS';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const COOLDOWN_REDUCTION = 100;

class RecklessFlurry extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  recklessFlurryDamage = 0;
  effectiveReduction = 0;
  wastedReduction = 0;

  constructor(...args) {
    super(...args);

    this.active = this.selectedCombatant.hasTrait(SPELLS.RECKLESS_FLURRY.id);
    
    if(!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RECKLESS_FLURRY_DAMAGE), this.onRecklessFlurry);
  }

  onRecklessFlurry(event) {
    this.recklessFlurryDamage += event.amount + (event.absorbed || 0);

    if (!this.spellUsable.isOnCooldown(SPELLS.RECKLESSNESS.id)) {
      this.wastedReduction += COOLDOWN_REDUCTION;
    } else {
      const effectiveReduction = this.spellUsable.reduceCooldown(SPELLS.RECKLESSNESS.id, COOLDOWN_REDUCTION);
      this.effectiveReduction += effectiveReduction;
      this.wastedReduction += COOLDOWN_REDUCTION - effectiveReduction;
    }
  }

  get damagePercentage() {
    return this.owner.getPercentageOfTotalDamageDone(this.recklessFlurryDamage);
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.RECKLESS_FLURRY.id}
        value={`${formatNumber(this.effectiveReduction / 1000)}s Recklessness CDR`}
        tooltip={`Reckless Flurry did <b>${formatThousands(this.recklessFlurryDamage)} (${formatPercentage(this.damagePercentage)}%)</b> damage, with ${formatNumber(this.wastedReduction / 1000)}s of wasted Recklessness CDR`}
      />
    );
  }
}

export default RecklessFlurry;