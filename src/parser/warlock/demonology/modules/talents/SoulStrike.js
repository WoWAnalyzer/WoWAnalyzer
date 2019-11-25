import React from 'react';

import Analyzer, { SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

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

  subStatistic() {
    const shardsGained = this.soulShardTracker.getGeneratedBySpell(SPELLS.SOUL_STRIKE_SHARD_GEN.id);
    return (
      <>
        <StatisticListBoxItem
          title={<><SpellLink id={SPELLS.SOUL_STRIKE_TALENT.id} /> dmg</>}
          value={this.owner.formatItemDamageDone(this.damage)}
          valueTooltip={`${formatThousands(this.damage)} damage`}
        />
        <StatisticListBoxItem
          title={<>Shards generated with <SpellLink id={SPELLS.SOUL_STRIKE_TALENT.id} /></>}
          value={shardsGained}
        />
      </>
    );
  }
}

export default SoulStrike;
