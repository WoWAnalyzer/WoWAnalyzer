import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import StatTracker from 'parser/shared/modules/StatTracker';

import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

import { binomialPMF, findMax } from 'parser/warlock/shared/probability';
import SoulShardTracker from '../soulshards/SoulShardTracker';

const PROC_CHANCE = 0.04;
const INCINERATE_SP_COEFFICIENT = 0.641;
const debug = false;

class ChaosShards extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    soulShardTracker: SoulShardTracker,
  };

  bonus = 0;
  damage = 0;
  opportunities = 0;

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
    this.addEventListener(SoulShardTracker.fullshardgained, this.onFullShardGained);
  }

  onIncinerateDamage(event) {
    const [ damage ] = calculateBonusAzeriteDamage(event, [this.bonus], INCINERATE_SP_COEFFICIENT, this.statTracker.currentIntellectRating);
    this.damage += damage;
  }

  onFullShardGained() {
    this.opportunities += 1;
  }

  statistic() {
    const generated = this.soulShardTracker.getGeneratedBySpell(SPELLS.CHAOS_SHARDS_BUFF_ENERGIZE.id);
    const wasted = this.soulShardTracker.getWastedBySpell(SPELLS.CHAOS_SHARDS_BUFF_ENERGIZE.id);
    const total = generated + wasted;
    const { max } = findMax(this.opportunities, (k, n) => binomialPMF(k, n, PROC_CHANCE));
    return (
      <TraitStatisticBox
        trait={SPELLS.CHAOS_SHARDS.id}
        value={<ItemDamageDone amount={this.damage} approximate />}
        tooltip={`Estimated bonus Incinerate damage: ${formatThousands(this.damage)}<br />
                  You gained ${generated} Fragments and wasted ${wasted} Fragments with this trait
                  ${max > 0 ?
                    `, which is <strong>${formatPercentage(total / (max * 10))} %</strong> of Fragments you were most likely to get in this fight (${max * 10} Fragments).`
                  :
                    ', while you were most likely to not get any Fragments.'
                  }
                  <br /><br />
                  The damage is an approximation using current Intellect values at given time, but because we might miss some Intellect buffs (e.g. trinkets, traits), the value of current Intellect might be a little incorrect.`}
      />
    );
  }
}

export default ChaosShards;
