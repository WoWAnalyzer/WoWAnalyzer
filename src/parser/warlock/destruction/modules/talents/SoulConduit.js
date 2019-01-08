import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatThousands } from 'common/format';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import { binomialPMF } from 'parser/warlock/shared/probability';
import SoulShardTracker from '../soulshards/SoulShardTracker';

const FRAGMENTS_PER_CHAOS_BOLT = 20;
const SC_PROC_CHANCE = 0.15;

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
    const totalSpent = this.soulShardTracker.spent / 10; // Destruction Soul Shard Tracker tracks fragments (10 fragments per shard)
    // Binomial distribution follows a bell-shaped curve
    // iterate upwards from k = 0, search for local (=global) maximum, when value starts to decrease, break
    let max = -1;
    let maxP = 0;
    for (let i = 0; i <= totalSpent; i++) {
      const p = binomialPMF(i, totalSpent, SC_PROC_CHANCE);
      if (p > maxP) {
        max = i;
        maxP = p;
      } else if (p < maxP) {
        break;
      }
    }
    return (
      <StatisticListBoxItem
        title={<>Fragments generated with <SpellLink id={SPELLS.SOUL_CONDUIT_TALENT.id} /></>}
        value={generated}
        valueTooltip={`You gained ${generated} fragments from this talent, which is <strong>${formatPercentage(generated / max)}%</strong> of fragments you were most likely to get in this fight (${max} fragments).<br />
          Estimated damage: ${formatThousands(estimatedDamage)} (${this.owner.formatItemDamageDone(estimatedDamage)}).<br /><br />

          This result is estimated by multiplying average Chaos Bolt damage by potential casts you would get from these bonus fragments.`}
      />
    );
  }
}

export default SoulConduit;
