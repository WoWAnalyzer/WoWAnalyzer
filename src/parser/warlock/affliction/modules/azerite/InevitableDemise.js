import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Entities from 'parser/shared/modules/Entities';
import Events from 'parser/core/Events';

import HIT_TYPES from 'game/HIT_TYPES';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatThousands } from 'common/format';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

const debug = false;

class InevitableDemise extends Analyzer {
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
    const bonusDamage = this._currentStacks * this.damagePerStack * (event.hitType === HIT_TYPES.CRIT ? 2 : 1);
    debug && this.log(`Drain Life damage, current stacks: ${this._currentStacks}, total damage: ${totalDamage}, base Drain damage: ${totalDamage - bonusDamage}, bonus damage: ${bonusDamage}`);
    this.damage += bonusDamage;
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.INEVITABLE_DEMISE.id}
        value={<ItemDamageDone amount={this.damage} />}
        tooltip={`Bonus Drain Life damage: ${formatThousands(this.damage)}`}
      />
    );
  }
}

export default InevitableDemise;
