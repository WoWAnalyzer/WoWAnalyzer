import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import CrashingChaosChaoticInfernoCore from './CrashingChaosChaoticInfernoCore';

const STACKS_PER_PROC = 8;

class CrashingChaos extends Analyzer {
  static dependencies = {
    core: CrashingChaosChaoticInfernoCore,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.CRASHING_CHAOS.id);
  }

  statistic() {
    const history = this.selectedCombatant.getBuffHistory(SPELLS.CRASHING_CHAOS_BUFF.id);
    const allProcs = history.length * STACKS_PER_PROC;
    const usedProcs = history.map(buff => STACKS_PER_PROC - buff.stacks).reduce((total, current) => total + current, 0);
    const dps = this.core.crashingChaosDamage / this.owner.fightDuration * 1000;

    return (
      <AzeritePowerStatistic
        size="small"
        tooltip={(
          <>
            Bonus Chaos Bolt damage: {formatThousands(this.core.crashingChaosDamage)}<br />
            You used {usedProcs} out of {allProcs} Crashing Chaos stacks.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.CRASHING_CHAOS}>
          {formatNumber(dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.core.crashingChaosDamage))} % of total</small>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default CrashingChaos;
