import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import { formatPercentage, formatThousands } from 'common/format';

// Example Log: /report/aBxvzDZJQP7431Nt/21-Normal+G'huun+-+Kill+(7:11)/15-Liarine
class Perseverance extends Analyzer {
  totalDamageReduced = 0;
  perseveranceActive = false;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PERSEVERANCE_TALENT.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.RENEW.id) / this.owner.fightDuration;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.RENEW.id && event.targetID === this.selectedCombatant._combatantInfo.sourceID) {
      this.perseveranceActive = true;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.RENEW.id && event.targetID === this.selectedCombatant._combatantInfo.sourceID) {
      this.perseveranceActive = false;
    }
  }

  on_toPlayer_damage(event) {
    if (this.perseveranceActive) {
      this.totalDamageReduced += event.amount * .1;
    }
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.PERSEVERANCE_TALENT.id}
        value={<ItemHealingDone amount={this.totalDamageReduced} />}
        tooltip={`
          Perseverance Uptime: ${formatPercentage(this.uptime)}%<br />
          Damage Reduced: ${formatThousands(this.totalDamageReduced)}
          `}
        position={STATISTIC_ORDER.CORE(2)}
      />
    );
  }
}

export default Perseverance;
