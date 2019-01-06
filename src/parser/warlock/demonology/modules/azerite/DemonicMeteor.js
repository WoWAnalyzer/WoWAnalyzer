import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';

import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatPercentage, formatThousands } from 'common/format';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

import { poissonBinomialCDF } from 'parser/warlock/shared/probability';
import SoulShardTracker from '../soulshards/SoulShardTracker';

const HOG_SP_COEFFICIENT = 0.16; // taken from Simcraft SpellDataDump
const HOG_CHANCE_PER_SHARD = 0.05;

/*
    Demonic Meteor
      Hand of Gul'dan deals X additional damage and has a 5% chance per Soul Shard spent of refunding a Soul Shard.
 */
class DemonicMeteor extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
    statTracker: StatTracker,
  };

  traitBonus = 0;
  damage = 0;
  probabilities = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.DEMONIC_METEOR.id);
    if (!this.active) {
      return;
    }

    this.traitBonus = this.selectedCombatant.traitsBySpellId[SPELLS.DEMONIC_METEOR.id].reduce((total, rank) => {
      const [ damage ] = calculateAzeriteEffects(SPELLS.DEMONIC_METEOR.id, rank);
      return total + damage;
    }, 0);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.HAND_OF_GULDAN_DAMAGE), this.onHogDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HAND_OF_GULDAN_CAST), this.onHogCast);
  }

  onHogCast(event) {
    if (!event.classResources) {
      return;
    }
    const shards = event.classResources.find(resource => resource.type === RESOURCE_TYPES.SOUL_SHARDS.id);
    if (!shards) {
      return;
    }
    // store shards spent on Hand of Gul'dan - percentage chance to proc the trait (5% per shard)
    this.probabilities.push(shards.cost * HOG_CHANCE_PER_SHARD);
  }

  onHogDamage(event) {
    const [ bonusDamage ] = calculateBonusAzeriteDamage(event, [this.traitBonus], HOG_SP_COEFFICIENT, this.statTracker.currentIntellectRating);
    this.damage += bonusDamage;
  }

  statistic() {
    const shardsGained = this.soulShardTracker.getGeneratedBySpell(SPELLS.DEMONIC_METEOR_SHARD_GEN.id);
    // we need to get the amount of shards we were most likely to get given certain probabilities
    // this corresponds to the highest PMF in the distribution
    // which should be calculated when calling CDF for a high enough k (since it recursively calculates values for lesser k, we should be able to get it from the lookup table)
    const { lookup } = poissonBinomialCDF(Math.round(this.probabilities.length / 2), this.probabilities.length, this.probabilities);
    let maxP = 0; // maximum probability
    let max = -1; // k of the maximum probability - should be the most likely amount of shards to get with given probabilities
    lookup.forEach((row, k) => {
      // row is an array of values Ek,j where for each row, k is fixed and we're finding the maximum of the last value (which is Ek,n)
      // last = Ek,n = chance to proc k out of n times
      const last = row[row.length - 1];
      if (last > maxP) {
        maxP = last;
        max = k;
      }
    });
    return (
      <TraitStatisticBox
        trait={SPELLS.DEMONIC_METEOR.id}
        value={<ItemDamageDone amount={this.damage} approximate />}
        tooltip={`Estimated bonus Hand of Gul'dan damage: ${formatThousands(this.damage)}<br />
                You gained ${shardsGained} Shards with this trait, which is <strong>${formatPercentage(shardsGained / max)} %</strong> of procs you were most likely to get in this fight (${max} procs).<br /><br />
                The damage is an approximation using current Intellect values at given time, but because we might miss some Intellect buffs (e.g. trinkets, traits), the value of current Intellect might be a little incorrect.`}
      />
    );
  }
}
export default DemonicMeteor;
