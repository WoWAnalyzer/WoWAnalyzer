import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

const DAMAGE_BONUS = 0.25;
const MAX_STACKS = 4;
const STACKS_PER_CAST = 2;
const debug = false;

class Flashover extends Analyzer {
  _currentStacks = 0;
  bonusStacks = 0;
  wastedStacks = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FLASHOVER_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.CONFLAGRATE.id) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, DAMAGE_BONUS);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.CONFLAGRATE.id) {
      return;
    }
    if (this._currentStacks <= MAX_STACKS - STACKS_PER_CAST) {
      // We don't waste the base Backdraft stack, nor the bonus one
      this._currentStacks += STACKS_PER_CAST;
      this.bonusStacks += 1;
    }
    else {
      // Conflagrate grants 2 stacks with Flashover, we can attribute 1 to the base Conflagrate and 1 to the Flashover, in this case the Flashover one would get wasted
      debug && this.log('WASTE');
      this._currentStacks = MAX_STACKS;
      this.wastedStacks += 1;
    }
    debug && this.log(`Stacks after conflag cast: ${this._currentStacks}`);
  }

  on_toPlayer_removebuffstack(event) {
    if (event.ability.guid !== SPELLS.BACKDRAFT.id) {
      return;
    }
    this._currentStacks -= 1;
    debug && this.log(`Remove buff stack, current: ${this._currentStacks}`);
  }

  on_toPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.BACKDRAFT.id) {
      return;
    }
    this._currentStacks = 0;
    debug && this.log(`Remove buff, current: ${this._currentStacks}`);
  }

  subStatistic() {
    return (
      <>
        <StatisticListBoxItem
          title={<><SpellLink id={SPELLS.FLASHOVER_TALENT.id} /> bonus damage</>}
          value={formatThousands(this.damage)}
          valueTooltip={this.owner.formatItemDamageDone(this.damage)}
        />
        <StatisticListBoxItem
          title={<>Bonus <SpellLink id={SPELLS.BACKDRAFT.id} /> stacks from <SpellLink id={SPELLS.FLASHOVER_TALENT.id} /></>}
          value={this.bonusStacks}
          valueTooltip={`You wasted ${this.wastedStacks} bonus stacks (Conflagrate on 3 or 4 stacks of Backdraft).`}
        />
      </>
    );
  }
}

export default Flashover;
