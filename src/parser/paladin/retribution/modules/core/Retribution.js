import React from 'react';

import Analyzer from 'parser/core/Analyzer';

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
    this.abilitiesAffectedByRetribution.push(SPELLS.MELEE.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!this.selectedCombatant.hasBuff(SPELLS.RETRIBUTION_BUFF.id) || !this.abilitiesAffectedByRetribution.includes(spellId)) {
      return;
    }
    this.bonusDmg += calculateEffectiveDamage(event, RETRIBUTION_DAMAGE_BONUS);
  }

  on_fightend() {
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
