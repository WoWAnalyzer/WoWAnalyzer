import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import { binomialCDF } from 'parser/warlock/shared/probability';
import SoulShardTracker from '../soulshards/SoulShardTracker';

const SHARDS_PER_HOG = 3;
const SC_PROC_CHANCE = 0.15;

class SoulConduit extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SOUL_CONDUIT_TALENT.id);
  }

  subStatistic() {
    const generated = this.soulShardTracker.getGeneratedBySpell(SPELLS.SOUL_CONDUIT_SHARD_GEN.id);
    const extraHogs = Math.floor(generated / SHARDS_PER_HOG);
    const totalSpent = this.soulShardTracker.spent;
    // since we want to get the amount of shards we would MOST LIKELY get, we intentionally need to try higher values for k than usually possible
    const { partial: probabilities } = binomialCDF(Math.round(totalSpent / 2), totalSpent, SC_PROC_CHANCE);
    // with 15% chance per shard, it's very unlikely that we would get half of the shards refunded, so the maximum must be somewhere lower than that, and "partial" array of the return object contains those values
    let maxP = 0;
    let max = -1;
    probabilities.forEach((p, k) => {
      if (p > maxP) {
        maxP = p;
        max = k;
      }
    });
    return (
      <StatisticListBoxItem
        title={<>Shards generated with <SpellLink id={SPELLS.SOUL_CONDUIT_TALENT.id} /></>}
        value={generated}
        valueTooltip={`You gained ${generated} Soul Shards from this talent (<strong>${formatPercentage(generated / max)}%</strong> of Shards you could expect in this fight.)<br />
                      You would get ${extraHogs} extra 3 shard Hands of Gul'dan with shards from this talent.`}
      />
    );
  }
}

export default SoulConduit;
