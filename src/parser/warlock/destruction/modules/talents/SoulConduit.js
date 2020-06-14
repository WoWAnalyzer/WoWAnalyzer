import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';

import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { findMax, binomialPMF } from 'parser/shared/modules/helpers/Probability';

import SoulShardTracker from '../soulshards/SoulShardTracker';

const FRAGMENTS_PER_SHARD = 10;
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

  statistic() {
    const generatedShards = this.soulShardTracker.getGeneratedBySpell(SPELLS.SOUL_CONDUIT_SHARD_GEN.id) / FRAGMENTS_PER_SHARD;
    const estimatedDamage = Math.floor(generatedShards / 2) * this.averageChaosBoltDamage; // Chaos Bolt costs 2 shards to cast
    const totalSpent = this.soulShardTracker.spent / FRAGMENTS_PER_SHARD; // Destruction Soul Shard Tracker tracks fragments (10 fragments per shard)
    // find number of Shards we were MOST LIKELY to get in the fight
    const { max } = findMax(totalSpent, (k, n) => binomialPMF(k, n, SC_PROC_CHANCE));
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="small"
        tooltip={(
          <>
            You gained {generatedShards} Shards from this talent, {max > 0 ? <>which is <strong>{formatPercentage(generatedShards / max)}%</strong> of Shards you were most likely to get in this fight ({max} Shards)</> : ', while you were most likely to not get any Shards'}.<br />
            Estimated damage: {formatThousands(estimatedDamage)} ({this.owner.formatItemDamageDone(estimatedDamage)}).<br /><br />

            This result is estimated by multiplying average Chaos Bolt damage by potential casts you would get from these bonus Shards.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.SOUL_CONDUIT_TALENT}>
          {generatedShards} <small>generated Shards</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulConduit;
