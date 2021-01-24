import React from 'react';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { formatNumber } from 'common/format';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { ThresholdStyle } from 'parser/core/ParseResults';

class DeadEye extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  //Incremented in Aimed Shot module
  deadEyeEffectiveCDR: number = 0;
  deadEyePotentialCDR: number = 0;
  averageAimedShotCD: number = 0;

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DEAD_EYE_TALENT.id);
  }

  get deadEyeEfficacy() {
    return this.deadEyeEffectiveCDR / this.deadEyePotentialCDR;
  }

  get deadEyeEfficacyThresholds() {
    return {
      actual: this.deadEyeEfficacy,
      isLessThan: {
        minor: 0.8,
        average: 0.7,
        major: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            {formatNumber(this.deadEyeEffectiveCDR / 1000)}s effective Aimed Shot CDR
            <br />
            {formatNumber(this.deadEyePotentialCDR / 1000)}s potential Aimed Shot CDR, this include time where Aimed Shot was not on cooldown and Dead Eye buff was active
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.DEAD_EYE_TALENT}>
          <>
            {formatNumber(this.deadEyeEffectiveCDR / 1000)}/{formatNumber(this.deadEyePotentialCDR / 1000)}s <small> total Aimed Shot CDR</small>
            <br />
            <small>up to </small>{(this.deadEyeEffectiveCDR / this.averageAimedShotCD).toFixed(1)} <small>extra Aimed Shot casts</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default DeadEye;
