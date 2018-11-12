import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

import Analyzer from 'parser/core/Analyzer';

import SpellLink from 'common/SpellLink';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

/**
 * Your attacks have a chance to make your next Execute cost no Rage, 
 * be usable on any target regardless of their health, and deal damage as if you spent 40 Rage.
 */

class SuddenDeath extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SUDDEN_DEATH_TALENT_ARMS.id);
  }

  totalProc = 0;
  totalDamages = 0;

  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.SUDDEN_DEATH_TALENT_ARMS_BUFF.id) {
      return;
    }
    this.totalProc += 1;
  }

  on_byPlayer_refreshbuff(event) {
    if (event.ability.guid !== SPELLS.SUDDEN_DEATH_TALENT_ARMS_BUFF.id) {
      return;
    }
    this.totalProc += 1;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.EXECUTE_DAMAGE.id || !this.selectedCombatant.hasBuff(SPELLS.SUDDEN_DEATH_TALENT_ARMS_BUFF.id)) {
      return;
    }
    this.totalDamages += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.EXECUTE_DAMAGE.id} /> with <SpellLink id={SPELLS.SUDDEN_DEATH_TALENT_ARMS.id} /> damage</>}
        value={formatNumber(this.totalDamages)}
        valueTooltip={`Total Execute damage while Sudden Death was active (${this.totalProc} proc)`}
      />
    );
  }
}

export default SuddenDeath;