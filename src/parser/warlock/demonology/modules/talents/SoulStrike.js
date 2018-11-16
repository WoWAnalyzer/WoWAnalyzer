import React from 'react';

import Analyzer, { SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatThousands } from 'common/format';

import StatisticBox from 'interface/others/StatisticBox';

import SoulShardTracker from '../soulshards/SoulShardTracker';

class SoulStrike extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SOUL_STRIKE_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.SOUL_STRIKE_DAMAGE), this.handleSoulStrikeDamage);
  }

  handleSoulStrikeDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const shardsGained = this.soulShardTracker.getGeneratedBySpell(SPELLS.SOUL_STRIKE_SHARD_GEN.id);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SOUL_STRIKE_TALENT.id} />}
        value={formatThousands(this.damage)}
        label="Soul Strike damage"
        tooltip={`${this.owner.formatItemDamageDone(this.damage)}<br />
                  Shards gained from the talent: ${shardsGained}`}
      />
    );
  }
}

export default SoulStrike;
