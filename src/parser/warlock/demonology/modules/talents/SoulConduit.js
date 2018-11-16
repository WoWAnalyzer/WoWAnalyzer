import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import StatisticBox from 'interface/others/StatisticBox';

import SoulShardTracker from '../soulshards/SoulShardTracker';

class SoulConduit extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SOUL_CONDUIT_TALENT.id);
  }

  // TODO: damage estimate using average damage from HOG + their imps, Dreadstalkers and Vilefiend or Grimoire?
  statistic() {
    const generated = this.soulShardTracker.getGeneratedBySpell(SPELLS.SOUL_CONDUIT_SHARD_GEN.id);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SOUL_CONDUIT_TALENT.id} />}
        value={generated}
        label="Shards generated with Soul Conduit"
      />
    );
  }
}

export default SoulConduit;
