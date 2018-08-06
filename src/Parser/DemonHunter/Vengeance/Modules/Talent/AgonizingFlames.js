import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

const PERCENT_BUFF = 0.20;

class AgonizingFlames extends Analyzer {
  buffedDeathStrikes = 0;
  unbuffedDeathStrikes = 0;
  buffStack = 0;
  wastedBuffs = 0;
  gainedBuffs = 0;
  damage=0;
  heal=0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.AGONIZING_FLAMES_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.IMMOLATION_AURA_FIRST_STRIKE.id && spellID !== SPELLS.IMMOLATION_AURA_BUFF.id) {
      return;
    }
        this.damage += calculateEffectiveDamage(event, PERCENT_BUFF);
    }



  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.AGONIZING_FLAMES_TALENT.id} />}
        value={`${this.owner.formatItemDamageDone(this.damage)}`}
        label="Agonizing Flames"
        tooltip={`This shows the extra dps that the talent provides.<br/>
                  <b>Total extra damage:</b> ${formatNumber(this.damage)}`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default AgonizingFlames;
