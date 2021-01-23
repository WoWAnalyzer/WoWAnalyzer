import React from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';

import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { formatNumber, formatPercentage } from 'common/format';
import { DamageEvent, EventType } from 'parser/core/Events';
import EventFilter from 'parser/core/EventFilter';

const AVATAR_DAMAGE_INCREASE = 0.2;

class Avatar extends Analyzer {
  bonusDmg = 0;
  statisticOrder = STATISTIC_ORDER.CORE(5);

  constructor(options: Options) {
    super(options);
    this.addEventListener(new EventFilter(EventType.Damage).by(SELECTED_PLAYER), this.handleDamage);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.AVATAR_TALENT.id) / this.owner.fightDuration;
  }

  handleDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.AVATAR_TALENT.id)) {
      return;
    }

    this.bonusDmg += calculateEffectiveDamage(event, AVATAR_DAMAGE_INCREASE);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.AVATAR_TALENT.id} />}
        value={`${formatNumber((this.bonusDmg / this.owner.fightDuration) * 1000)} DPS`}
        label="Damage contributed"
        tooltip={
          <>
            Avatar contributed {formatNumber(this.bonusDmg)} total damage (
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%). <br />
            Uptime was {formatPercentage(this.uptime)}%
          </>
        }
      />
    );
  }
}

export default Avatar;
