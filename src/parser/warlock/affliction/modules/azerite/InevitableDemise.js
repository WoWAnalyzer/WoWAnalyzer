import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Entities from 'parser/shared/modules/Entities';
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

  _currentStacks = 0;
  damagePerStack = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.INEVITABLE_DEMISE.id);
    if (!this.active) {
      return;
    }
    this.damagePerStack = this.selectedCombatant.traitsBySpellId[SPELLS.INEVITABLE_DEMISE.id].reduce((total, rank) => {
      const [ damage ] = calculateAzeriteEffects(SPELLS.INEVITABLE_DEMISE.id, rank);
      return total + damage;
    }, 0);
    debug && this.log('Total damage per ID stack', this.damagePerStack);

    this.addEventListener(Entities.changebuffstack.by(SELECTED_PLAYER).spell(SPELLS.INEVITABLE_DEMISE_BUFF), this.onIDChangeBuffStack);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DRAIN_LIFE), this.onDrainLifeDamage);
  }

  onIDChangeBuffStack(event) {
    this._currentStacks = event.newStacks;
  }

  onDrainLifeDamage(event) {
    const totalDamage = event.amount + (event.absorbed || 0);
    const bonusDamage = calculateBonusAzeriteDamage(event, this._currentStacks * this.damagePerStack, DRAIN_LIFE_SP_COEFFICIENT, this.statTracker.currentIntellectRating);
    debug && this.log(`Drain Life damage, current stacks: ${this._currentStacks}, current bonus base damage: ${this._currentStacks * this.damagePerStack}, total damage: ${totalDamage}, Drain damage: ${totalDamage - bonusDamage}, bonus damage: ${bonusDamage}`);
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
