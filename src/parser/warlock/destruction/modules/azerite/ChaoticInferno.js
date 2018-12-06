import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

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
    return (
      <TraitStatisticBox
        trait={SPELLS.CHAOTIC_INFERNO.id}
        value={<ItemDamageDone amount={this.core.chaoticInfernoDamage} approximate />}
        tooltip={`Estimated bonus Chaos Bolt damage: ${formatThousands(this.core.chaoticInfernoDamage)}<br />
                  You procced instant Incinerate ${totalProcs} times.<br /><br />
                  The damage is an approximation using current Intellect values at given time, but because we might miss some Intellect buffs (e.g. trinkets, traits), the value of current Intellect might be a little incorrect.`}
      />
    );
  }
}

export default ChaoticInferno;
