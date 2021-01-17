import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage, formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';

const STARFALL_BONUS_DAMAGE = 0.25;

class StellarDrift extends Analyzer {
  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.bonusDamage);
  }

  get perSecond() {
    return this.bonusDamage / (this.owner.fightDuration / 1000);
  }

  bonusDamage = 0;
  statisticOrder = STATISTIC_ORDER.OPTIONAL();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STELLAR_DRIFT_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.STARFALL), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    this.bonusDamage += calculateEffectiveDamage(event, STARFALL_BONUS_DAMAGE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
        tooltip={`Contributed ${formatNumber(this.perSecond)} DPS (${formatNumber(this.bonusDamage)} total damage). This does not account for any extra damage gained from the increased radius or the ability to move while casting.`}
      >
        <BoringSpellValueText spell={SPELLS.STELLAR_DRIFT_TALENT}>
          <>
            {formatPercentage(this.damagePercent)} % <small>of total damage</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default StellarDrift;
