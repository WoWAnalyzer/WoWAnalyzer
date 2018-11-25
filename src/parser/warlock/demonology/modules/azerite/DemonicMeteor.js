import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatThousands } from 'common/format';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

import SoulShardTracker from '../soulshards/SoulShardTracker';

const HOG_SP_COEFFICIENT = 0.16; // taken from Simcraft SpellDataDump

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
  }

  onHogDamage(event) {
    this.damage += calculateBonusAzeriteDamage(event, this.traitBonus, HOG_SP_COEFFICIENT, this.statTracker.currentIntellectRating);
  }

  statistic() {
    const shardsGained = this.soulShardTracker.getGeneratedBySpell(SPELLS.DEMONIC_METEOR_SHARD_GEN.id);
    return (
      <TraitStatisticBox
        trait={SPELLS.DEMONIC_METEOR.id}
        value={<ItemDamageDone amount={this.damage} approximate />}
        tooltip={`Estimated bonus Hand of Gul'dan damage: ${formatThousands(this.damage)}<br />
                Shards gained with this trait: ${shardsGained}<br /><br />
                The damage is an approximation using current Intellect values at given time, but because we might miss some Intellect buffs (e.g. trinkets, traits), the value of current Intellect might be a little incorrect.`}
      />
    );
  }
}
export default DemonicMeteor;
