import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS';

import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { formatNumber, formatPercentage } from 'common/format';
import Events, { DamageEvent } from 'parser/core/Events';

import Statistic from 'interface/statistics/Statistic';
import BoringValueText from 'interface/statistics/components/BoringValueText'
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellLink from 'common/SpellLink';

const PUNISH_DAMAGE_INCREASE = 0.2;

class Punish extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  bonusDmg: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PUNISH_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM), this.onSlamDamage);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.PUNISH_DEBUFF.id) / this.owner.fightDuration;
  }

  onSlamDamage(event: DamageEvent) {
    this.bonusDmg += calculateEffectiveDamage(event, PUNISH_DAMAGE_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            Punish added a total of {formatNumber(this.bonusDmg)} damage to your Shield Slams ({formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%). <br />
            {formatPercentage(this.uptime)}% debuff uptime.
          </>
        )}
      >
        <BoringValueText label={<><SpellLink id={SPELLS.PUNISH_TALENT.id} /> Damage contributed</>}>
          <>
            {formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} <small>DPS</small>
          </>
        </BoringValueText>
      </Statistic>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Punish;
