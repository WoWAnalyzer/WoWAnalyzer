import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatPercentage, formatNumber } from 'common/format';

import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import CrashingChaosChaoticInfernoCore from './CrashingChaosChaoticInfernoCore';

class ChaoticInferno extends Analyzer {
  static dependencies = {
    core: CrashingChaosChaoticInfernoCore,
  };

  procs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.CHAOTIC_INFERNO.id);
    // getBuffTriggerCount (or for the matter, getBuffHistory) don't handle buff refreshes
    // I haven't found a log that does this (you get an instant damage spell, you instinctively fire it ASAP), but if it ever got refreshed, count it as an additional proc
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.CHAOTIC_INFERNO_BUFF), this.countChaoticInfernoRefresh);
  }

  countChaoticInfernoRefresh() {
    this.procs += 1;
  }

  statistic() {
    const triggerCount = this.selectedCombatant.getBuffTriggerCount(SPELLS.CHAOTIC_INFERNO_BUFF.id);
    const totalProcs = triggerCount + this.procs;
    const dps = this.core.chaoticInfernoDamage / this.owner.fightDuration * 1000;

    return (
      <AzeritePowerStatistic
        size="small"
        tooltip={(
          <>
            Bonus Chaos Bolt damage: {formatThousands(this.core.chaoticInfernoDamage)}<br />
            You procced instant Incinerate {totalProcs} times.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.CHAOTIC_INFERNO}>
          {formatNumber(dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.core.chaoticInfernoDamage))} % of total</small>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default ChaoticInferno;
