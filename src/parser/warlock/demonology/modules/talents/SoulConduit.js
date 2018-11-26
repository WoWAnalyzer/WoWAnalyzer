import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import SoulShardTracker from '../soulshards/SoulShardTracker';

const SHARDS_PER_HOG = 3;

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
    return (
      <StatisticListBoxItem
        title={<>Shards generated with <SpellLink id={SPELLS.SOUL_CONDUIT_TALENT.id} /></>}
        value={generated}
        valueTooltip={`You would get ${extraHogs} extra 3 shard Hands of Gul'dan with shards from this talent.`}
      />
    );
  }
}

export default SoulConduit;
