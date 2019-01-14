import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import { binomialPMF, findMax } from 'parser/warlock/shared/probability';
import { UNSTABLE_AFFLICTION_DEBUFFS } from '../../constants';
import SoulShardTracker from '../soulshards/SoulShardTracker';

const TICKS_PER_UA = 4;
const SC_PROC_CHANCE = 0.15;

class SoulConduit extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  _totalTicks = 0;
  _totalUAdamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SOUL_CONDUIT_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(UNSTABLE_AFFLICTION_DEBUFFS), this.onUnstableAfflictionDamage);
  }

  onUnstableAfflictionDamage(event) {
    this._totalTicks += 1;
    this._totalUAdamage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    // if we haven't cast any UAs, _totalTicks would be 0 and we would get an exception
    // but with denominator 1 in this case, if this._totalUAdamage = 0, then dividing by 1 still gives correct result of average damage = 0
    const avgDamage = this._totalUAdamage / (this._totalTicks > 0 ? this._totalTicks : 1);
    const shardsGained = this.soulShardTracker.getGeneratedBySpell(SPELLS.SOUL_CONDUIT_SHARD_GEN.id);
    const estimatedUAdamage = shardsGained * TICKS_PER_UA * avgDamage;
    const totalSpent = this.soulShardTracker.spent;
    // find number of Shards we were MOST LIKELY to get in the fight
    const { max } = findMax(totalSpent, (k, n) => binomialPMF(k, n, SC_PROC_CHANCE));
    return (
      <StatisticListBoxItem
        title={<>Shards generated with <SpellLink id={SPELLS.SOUL_CONDUIT_TALENT.id} /></>}
        value={shardsGained}
        valueTooltip={`You gained ${shardsGained} Shards from this talent
                      ${max > 0 ?
                          `, which is <strong>${formatPercentage(shardsGained / max)}%</strong> of Shards you were most likely to get in this fight (${max} Shards).`
                        :
                          ', while you were most likely to not get any Shards.'
                      }<br />
                      Estimated damage: ${formatThousands(estimatedUAdamage)} (${this.owner.formatItemDamageDone(estimatedUAdamage)})<br /><br />
                      This result is estimated by multiplying number of Soul Shards gained from this talent by the average Unstable Affliction damage for the whole fight.`}
      />
    );
  }
}

export default SoulConduit;
