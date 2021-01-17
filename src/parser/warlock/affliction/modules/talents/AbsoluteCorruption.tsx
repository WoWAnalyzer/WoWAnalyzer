import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

const AC_DAMAGE_BONUS = 0.15;

class AbsoluteCorruption extends Analyzer {
  get dps() {
    return (this.bonusDmg / this.owner.fightDuration) * 1000;
  }

  bonusDmg = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ABSOLUTE_CORRUPTION_TALENT.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CORRUPTION_DEBUFF),
      this.onCorruptionDamage,
    );
  }

  onCorruptionDamage(event: DamageEvent) {
    this.bonusDmg += calculateEffectiveDamage(event, AC_DAMAGE_BONUS);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatThousands(this.bonusDmg)} bonus damage
            <br />
            <br />
            Note: This only accounts for the passive 15% increased damage of Corruption. Actual
            bonus damage should be higher due to saved GCDs.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.ABSOLUTE_CORRUPTION_TALENT}>
          {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} % of total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AbsoluteCorruption;
