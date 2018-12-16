import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

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
    return (
      <TraitStatisticBox
        trait={SPELLS.CRASHING_CHAOS.id}
        value={<ItemDamageDone amount={this.core.crashingChaosDamage} approximate />}
        tooltip={`Estimated bonus Chaos Bolt damage: ${formatThousands(this.core.crashingChaosDamage)}<br />
                  You used ${usedProcs} out of ${allProcs} Crashing Chaos stacks.<br /><br />
                  The damage is an approximation using current Intellect values at given time, but because we might miss some Intellect buffs (e.g. trinkets, traits), the value of current Intellect might be a little incorrect.`}
      />
    );
  }
}

export default CrashingChaos;
