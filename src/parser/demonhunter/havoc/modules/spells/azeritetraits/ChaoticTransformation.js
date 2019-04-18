import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SpellIcon from 'common/SpellIcon';

class ChaoticTransformation extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  noResetEyeBeam = 0;
  noResetBladeDance = 0;
  resetEyeBeam = 0;
  resetBladeDance = 0;
  eyeBeamCDRemaining = 0;
  bladeDanceCDRemaining = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.CHAOTIC_TRANSFORMATION.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.METAMORPHOSIS_HAVOC), this.onMetaCast);
  }

  onMetaCast(event) {
    if (!this.spellUsable.isOnCooldown(SPELLS.EYE_BEAM.id)){
      this.noResetEyeBeam += 1;
    } else {
      this.resetEyeBeam += 1;
      this.spellUsable.endCooldown(SPELLS.EYE_BEAM.id);
      this.eyeBeamCDRemaining += this.spellUsable.cooldownRemaining(SPELLS.EYE_BEAM.id);
    }

    if (!this.spellUsable.isOnCooldown(SPELLS.BLADE_DANCE.id)){
      this.noResetBladeDance += 1;
    } else {
      this.resetBladeDance += 1;
      this.spellUsable.endCooldown(SPELLS.BLADE_DANCE.id);
      this.bladeDanceCDRemaining += this.spellUsable.cooldownRemaining(SPELLS.BLADE_DANCE.id);
    }
  }

  get casts() {
    return this.abilityTracker.getAbility(SPELLS.METAMORPHOSIS_HAVOC.id).casts || 0;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
          {this.soulsConsumed} souls consumed
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.CHAOTIC_TRANSFORMATION}>
          <SpellIcon id={SPELLS.EYE_BEAM.id} />
          <SpellIcon id={SPELLS.BLADE_DANCE.id} />
        </BoringSpellValueText>
      </ItemStatistic>
    );
  }
}

export default ChaoticTransformation;
