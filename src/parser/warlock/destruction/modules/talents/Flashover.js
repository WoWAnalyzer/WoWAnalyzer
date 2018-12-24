import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
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
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CONFLAGRATE), this.onConflagrateDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CONFLAGRATE), this.onConflagrateCast);
    this.addEventListener(Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.BACKDRAFT), this.onBackdraftRemoveBuffStack);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.BACKDRAFT), this.onBackdraftRemoveBuff);
  }

  onConflagrateDamage(event) {
    this.damage += calculateEffectiveDamage(event, DAMAGE_BONUS);
  }

  onConflagrateCast() {
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

  onBackdraftRemoveBuffStack() {
    this._currentStacks -= 1;
    debug && this.log(`Remove buff stack, current: ${this._currentStacks}`);
  }

  onBackdraftRemoveBuff() {
    this._currentStacks = 0;
    debug && this.log(`Remove buff, current: ${this._currentStacks}`);
  }

  subStatistic() {
    return (
      <>
        <StatisticListBoxItem
          title={<><SpellLink id={SPELLS.FLASHOVER_TALENT.id} /> bonus damage</>}
          value={this.owner.formatItemDamageDone(this.damage)}
          valueTooltip={`${formatThousands(this.damage)} bonus damage`}
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
