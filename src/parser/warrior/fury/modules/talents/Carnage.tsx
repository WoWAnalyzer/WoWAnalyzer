import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatNumber } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';

const DAMAGE_BONUS = 0.15;
const RAGE_REDUCTION_RATIO = 75 / 85;


// Example log: /reports/tBFv8P9R3kdDgHKJ#fight=1&type=damage-done
class Carnage extends Analyzer {
  damage: number = 0;
  rampageCasts: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.CARNAGE_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAMPAGE), this.onRampageCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.RAMPAGE_1, SPELLS.RAMPAGE_2, SPELLS.RAMPAGE_3, SPELLS.RAMPAGE_4]), this.onRampageDamage);
  }

  onRampageCast() {
    this.rampageCasts += 1;
  }

  onRampageDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, DAMAGE_BONUS);
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  get additionalRampageCasts() {
    return this.rampageCasts - Math.floor(this.rampageCasts * RAGE_REDUCTION_RATIO);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={<>Carnage allowed you to use Rampage <strong>~{this.additionalRampageCasts}</strong> additional times and contributed to <strong>{formatPercentage(this.damagePercent)}%</strong> of your overall damage.</>}
      >
        <BoringSpellValueText spell={SPELLS.CARNAGE_TALENT}>
          <>
            {formatNumber(this.damage)} damage
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Carnage;
