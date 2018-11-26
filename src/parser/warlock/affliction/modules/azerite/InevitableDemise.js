import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import StatTracker from 'parser/shared/modules/StatTracker';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatThousands } from 'common/format';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

const DRAIN_LIFE_SP_COEFFICIENT = 0.12; // taken from Simcraft SpellDataDump
const debug = false;

class InevitableDemise extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  damagePerStack = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.INEVITABLE_DEMISE.id);
    if (!this.active) {
      return;
    }
    const damageBeforeDR = this.selectedCombatant.traitsBySpellId[SPELLS.INEVITABLE_DEMISE.id].reduce((total, rank) => {
      const [ damage ] = calculateAzeriteEffects(SPELLS.INEVITABLE_DEMISE.id, rank);
      return total + damage;
    }, 0);
    const traitCount = this.selectedCombatant.traitsBySpellId[SPELLS.INEVITABLE_DEMISE.id].length;
    // Inevitable Demise suffers from diminishing returns for multiple traits
    // First trait is worth 100%, all others are 75%
    // 1 trait (100%) = damageBeforeDR * 1
    // 2 traits (87,5%) = damageBeforeDR * (1 + 0.75)/2 = 0.875 * damageBeforeDR
    // 3 traits (83,333%) = damageBeforeDR * (1 + 0.75 + 0.75)/3 = 0.833333 * damageBeforeDR
    this.damagePerStack = damageBeforeDR * ((1 + 0.75 * (traitCount - 1)) / traitCount); // traitCount should never be 0, if player doesn't have it, we return early

    debug && this.log(`Total damage per tick - before DR: ${damageBeforeDR}, trait count: ${traitCount}, after DR: ${this.damagePerStack}`);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DRAIN_LIFE), this.onDrainLifeDamage);
  }

  onDrainLifeDamage(event) {
    const buff = this.selectedCombatant.getBuff(SPELLS.INEVITABLE_DEMISE_BUFF.id);
    const currentStacks = buff ? buff.stacks : 0;
    const totalDamage = event.amount + (event.absorbed || 0);
    const [ bonusDamage ] = calculateBonusAzeriteDamage(event, currentStacks * this.damagePerStack, DRAIN_LIFE_SP_COEFFICIENT, this.statTracker.currentIntellectRating);
    debug && this.log(`Drain Life damage, current stacks: ${currentStacks}, current bonus base damage: ${currentStacks * this.damagePerStack}, total damage: ${totalDamage}, Drain damage: ${totalDamage - bonusDamage}, bonus damage: ${bonusDamage}`);
    this.damage += bonusDamage;
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.INEVITABLE_DEMISE.id}
        value={<ItemDamageDone amount={this.damage} approximate />}
        tooltip={`Estimated bonus Drain Life damage: ${formatThousands(this.damage)}<br /><br />
                The damage is an approximation using current Intellect values at given time. Note that because we might miss some Intellect buffs (e.g. trinkets, traits), the value of current Intellect might be also little incorrect`}
      />
    );
  }
}

export default InevitableDemise;
