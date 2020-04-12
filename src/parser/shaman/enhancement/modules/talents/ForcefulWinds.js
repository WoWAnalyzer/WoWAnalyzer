import React from 'react';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

const FORCEFUL_WINDS_DAMAGE_MODIFIER = 0.8;

class ForcefulWinds extends Analyzer {

  damageGained=0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FORCEFUL_WINDS_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const buff = this.selectedCombatant.getBuff(SPELLS.FORCEFUL_WINDS_BUFF.id);
    if(!buff){
      return;
    }
    if(event.ability.guid!==SPELLS.WINDFURY_ATTACK.id){
      return;
    }
    const stacks = buff.stacks || 0;
    this.damageGained += calculateEffectiveDamage(event, stacks * FORCEFUL_WINDS_DAMAGE_MODIFIER);
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageGained);
  }

  get damagePerSecond() {
    return this.damageGained / (this.owner.fightDuration / 1000);
  }

  statistic() {
    return (
      <TalentStatisticBox
        icon={<SpellIcon id={SPELLS.FORCEFUL_WINDS_TALENT.id} />}
        value={`${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`Contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage).`}
      />
    );
  }
}

export default ForcefulWinds;
