import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

const COOLDOWN_REDUCTION_MS = 700;

/**
 * Eyes of Rage
 * Eye Beam deals an additional 1390 damage.
 * Consuming a Soul Fragment reduces the cooldown of Eye Beam by 0.7 sec.
 *
 * Example Report: https://www.warcraftlogs.com/reports/ja72gPMKhptAC41Q/#fight=32&source=82
 */

class EyesofRage extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  totalCooldownReductionWasted = 0;
  totalCooldownReduction = 0;
  soulsConsumed = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.EYES_OF_RAGE.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CONSUME_SOUL), this.onConsumeSoulEvent);
  }

  onConsumeSoulEvent(event) {
    this.soulsConsumed += 1;
    if (!this.spellUsable.isOnCooldown(SPELLS.EYE_BEAM.id)){
      this.totalCooldownReductionWasted += COOLDOWN_REDUCTION_MS;
    } else {
      const effectiveReduction = this.spellUsable.reduceCooldown(SPELLS.EYE_BEAM.id, COOLDOWN_REDUCTION_MS);
      this.totalCooldownReduction += effectiveReduction;
      this.totalCooldownReductionWasted += COOLDOWN_REDUCTION_MS - effectiveReduction;
    }
  }

  get casts() {
    return this.abilityTracker.getAbility(SPELLS.EYE_BEAM.id).casts || 0;
  }

  get averageReduction(){
    return ((this.totalCooldownReduction / 1000) / this.casts) || 0;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
            {this.soulsConsumed} souls consumed <br />
            {(this.totalCooldownReductionWasted / 1000).toFixed(2)} sec wasted
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.EYES_OF_RAGE}>
          {this.averageReduction.toFixed(2)} sec <small>average reduction</small>
        </BoringSpellValueText>
      </ItemStatistic>
    );
  }
}

export default EyesofRage;
