import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import SoulShardTracker from '../soulshards/SoulShardTracker';

const FRAGMENTS_PER_CHAOS_BOLT = 20;

class SoulConduit extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SOUL_CONDUIT_TALENT.id);
  }

  get averageChaosBoltDamage() {
    const chaosBolt = this.abilityTracker.getAbility(SPELLS.CHAOS_BOLT.id);
    return ((chaosBolt.damageEffective + chaosBolt.damageAbsorbed) / chaosBolt.casts) || 0;
  }

  subStatistic() {
    const generated = this.soulShardTracker.getGeneratedBySpell(SPELLS.SOUL_CONDUIT_SHARD_GEN.id);
    const estimatedDamage = Math.floor(generated / FRAGMENTS_PER_CHAOS_BOLT) * this.averageChaosBoltDamage;

    return (
      <StatisticListBoxItem
        title={<>Fragments generated with <SpellLink id={SPELLS.SOUL_CONDUIT_TALENT.id} /></>}
        value={generated}
        valueTooltip={`Estimated damage: ${formatThousands(estimatedDamage)} (${this.owner.formatItemDamageDone(estimatedDamage)}).
          This result is estimated by multiplying average Chaos Bolt damage by potential casts you would get from these bonus fragments.`}
      />
    );
  }
}

export default SoulConduit;
