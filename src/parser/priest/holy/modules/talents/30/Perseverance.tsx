import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';
import ItemHealingDone from 'interface/ItemHealingDone';
import { formatPercentage, formatThousands } from 'common/format';
import { ApplyBuffEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

// Example Log: /report/aBxvzDZJQP7431Nt/21-Normal+G'huun+-+Kill+(7:11)/15-Liarine
class Perseverance extends Analyzer {
  totalDamageReduced = 0;
  perseveranceActive = false;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PERSEVERANCE_TALENT.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.RENEW.id) / this.owner.fightDuration;
  }

  on_byPlayer_applybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.RENEW.id && event.targetID === this.selectedCombatant._combatantInfo.sourceID) {
      this.perseveranceActive = true;
    }
  }

  on_byPlayer_removebuff(event: RemoveBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.RENEW.id && event.targetID === this.selectedCombatant._combatantInfo.sourceID) {
      this.perseveranceActive = false;
    }
  }

  on_toPlayer_damage(event: DamageEvent) {
    if (this.perseveranceActive) {
      this.totalDamageReduced += event.amount * .1;
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={(
          <>
            Perseverance Uptime: {formatPercentage(this.uptime)}%<br />
            Damage Reduced: {formatThousands(this.totalDamageReduced)}
          </>
        )}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(2)}
      >
        <BoringSpellValueText spell={SPELLS.PERSEVERANCE_TALENT}>
          <ItemHealingDone amount={this.totalDamageReduced} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Perseverance;
