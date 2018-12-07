import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES } from '../../constants';


const RETRIBUTION_DAMAGE_BONUS = 0.2;

class Retribution extends Analyzer {
  bonusDmg = 0;
  abilitiesAffectedByRetribution = ABILITIES_AFFECTED_BY_DAMAGE_INCREASES.slice();

  constructor(...args) {
    super(...args);
    this.abilitiesAffectedByRetribution.push(SPELLS.MELEE);

    // event listeners
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_DAMAGE_INCREASES), this.onAffectedDamage);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onAffectedDamage(event) {
    if (this.selectedCombatant.hasBuff(SPELLS.RETRIBUTION_BUFF.id)) {
      this.bonusDmg += calculateEffectiveDamage(event, RETRIBUTION_DAMAGE_BONUS);
    }
  }

  onFightEnd() {
    this.active = this.bonusDmg > 0;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.UNIMPORTANT()}
        icon={<SpellIcon id={SPELLS.RETRIBUTION_BUFF.id} />}
        value={`${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label="Damage contributed"
        tooltip={`Retribution contributed ${formatNumber(this.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} %).`}
      />
    );
  }
}

export default Retribution;
