import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SoulShardTracker from 'parser/warlock/affliction/modules/soulshards/SoulShardTracker';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

class PandemicInvocation extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PANDEMIC_INVOCATION.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PANDEMIC_INVOCATION_DAMAGE), this.onPandemicInvocationDamage);
  }

  onPandemicInvocationDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const pandemic = this.soulShardTracker.buildersObj[SPELLS.PANDEMIC_INVOCATION_ENERGIZE.id];
    const generated = pandemic.generated || 0;
    const wasted = pandemic.wasted || 0;
    return (
      <TraitStatisticBox
        trait={SPELLS.PANDEMIC_INVOCATION.id}
        value={<ItemDamageDone amount={this.damage} />}
        tooltip={`Pandemic Invocation damage: ${formatThousands(this.damage)}<br />
                  You gained ${generated} Soul Shards and wasted ${wasted} Soul Shards with this trait.`}
      />
    );
  }
}

export default PandemicInvocation;
