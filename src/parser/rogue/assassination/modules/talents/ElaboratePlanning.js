import React from 'react';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES } from '../../constants';

const DAMAGE_BONUS = 0.1;

class ElaboratePlanning extends Analyzer {

  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ELABORATE_PLANNING_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!this.selectedCombatant.hasBuff(SPELLS.ELABORATE_PLANNING_BUFF.id) || !ABILITIES_AFFECTED_BY_DAMAGE_INCREASES.includes(spellId)) {
      return;
    }
    this.bonusDmg += calculateEffectiveDamage(event, DAMAGE_BONUS);
  }

  get percentUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ELABORATE_PLANNING_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <TalentStatisticBox
        position={STATISTIC_ORDER.OPTIONAL(1)}
        icon={<SpellIcon id={SPELLS.ELABORATE_PLANNING_TALENT.id} />}
        value={`${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label="Elaborate Planning"
        tooltip={`${formatPercentage(this.percentUptime)} % uptime. Elaborate Planning contributed ${formatNumber(this.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} %).`}
      />
    );
  }

}

export default ElaboratePlanning;
