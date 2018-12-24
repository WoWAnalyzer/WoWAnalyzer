import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import StatTracker from 'parser/shared/modules/StatTracker';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

import SoulShardTracker from '../soulshards/SoulShardTracker';

const INCINERATE_SP_COEFFICIENT = 0.641;
const debug = false;

class ChaosShards extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    soulShardTracker: SoulShardTracker,
  };

  bonus = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.CHAOS_SHARDS.id);
    if (!this.active) {
      return;
    }

    this.bonus = this.selectedCombatant.traitsBySpellId[SPELLS.CHAOS_SHARDS.id]
      .reduce((total, rank) => {
        const [ damage ] = calculateAzeriteEffects(SPELLS.CHAOS_SHARDS.id, rank);
        debug && this.log(`Rank ${rank}, damage ${damage}`);
        return total + damage;
      }, 0);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.INCINERATE), this.onIncinerateDamage);
  }

  onIncinerateDamage(event) {
    const [ damage ] = calculateBonusAzeriteDamage(event, [this.bonus], INCINERATE_SP_COEFFICIENT, this.statTracker.currentIntellectRating);
    this.damage += damage;
  }

  statistic() {
    const chaosShards = this.soulShardTracker.buildersObj[SPELLS.CHAOS_SHARDS_BUFF_ENERGIZE.id];
    const generated = chaosShards.generated || 0;
    const wasted = chaosShards.wasted || 0;
    return (
      <TraitStatisticBox
        trait={SPELLS.CHAOS_SHARDS.id}
        value={<ItemDamageDone amount={this.damage} approximate />}
        tooltip={`Estimated bonus Incinerate damage: ${formatThousands(this.damage)}<br />
                  You gained ${generated} Soul Shard Fragments and wasted ${wasted} Soul Shard Fragments with this trait.<br /><br />
                  The damage is an approximation using current Intellect values at given time, but because we might miss some Intellect buffs (e.g. trinkets, traits), the value of current Intellect might be a little incorrect.`}
      />
    );
  }
}

export default ChaosShards;
