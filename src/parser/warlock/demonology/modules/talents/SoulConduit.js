import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import { binomialPMF, findMax } from 'parser/warlock/shared/probability';
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
    // find number of Shards we were MOST LIKELY to get in the fight
    const { max } = findMax(totalSpent, SC_PROC_CHANCE, binomialPMF);
    return (
      <StatisticListBoxItem
        title={<>Shards generated with <SpellLink id={SPELLS.SOUL_CONDUIT_TALENT.id} /></>}
        value={generated}
        valueTooltip={`You gained ${generated} Shards from this talent, which is <strong>${formatPercentage(generated / max)}%</strong> of Shards you were most likely to get in this fight (${max} Shards)<br />
                      You would get ${extraHogs} extra 3 shard Hands of Gul'dan with shards from this talent.`}
      />
    );
  }
}

export default SoulConduit;
