import React from 'react';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES } from '../../constants';

const DAMAGE_BONUS = 0.1;

class ElaboratePlanning extends Analyzer {

  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ELABORATE_PLANNING_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_DAMAGE_INCREASES), this.addBonusDamageIfBuffed);
  }

  addBonusDamageIfBuffed(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.ELABORATE_PLANNING_BUFF.id) &&!this.selectedCombatant.hasBuff(SPELLS.VANISH_BUFF.id)) {
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
        talent={SPELLS.ELABORATE_PLANNING_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(1)}
        value={<ItemDamageDone amount={this.bonusDmg} />}
        tooltip={`${formatPercentage(this.percentUptime)} % uptime.`}
      />
    );
  }

}

export default ElaboratePlanning;
