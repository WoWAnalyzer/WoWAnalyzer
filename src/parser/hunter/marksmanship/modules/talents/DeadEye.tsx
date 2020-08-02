import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { formatNumber } from 'common/format';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class DeadEye extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DEAD_EYE_TALENT.id);
  }

  //Incremented in Aimed Shot module
  deadEyeEffectiveCDR: number = 0;
  deadEyePotentialCDR: number = 0;
  averageAimedShotCD: number = 0;

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            {this.deadEyeEffectiveCDR / 1000}s effective Aimed Shot CDR
            {this.deadEyePotentialCDR / 1000}s potential Aimed Shot CDR, this include time where Aimed Shot was not on cooldown and Dead Eye buff was active
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.DEAD_EYE_TALENT}>
          <>
            {formatNumber(this.deadEyeEffectiveCDR / 1000)}s <small> total Aimed Shot CDR</small>
            <br />
            <small>up to </small>{(this.deadEyeEffectiveCDR / this.averageAimedShotCD).toFixed(1)} <small>extra Aimed Shot casts</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default DeadEye;
