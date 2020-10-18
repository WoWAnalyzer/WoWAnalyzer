import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Events from 'parser/core/Events';

const BONUS_DAMAGE_PER_STACK = 0.08;

/*
  Grimoire of Supremacy - While you have an Infernal active, every Soul Shard you spend increases the damage of your Chaos Bolt by 8%
 */
class GrimoireOfSupremacy extends Analyzer {
  _currentStacks = 0;
  // number of stacks per Infernal cast (gets pushed AFTER it falls off)
  casts = [];
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id);
    this.addEventListener(Events.changebuffstack.by(SELECTED_PLAYER).spell(SPELLS.GRIMOIRE_OF_SUPREMACY_BUFF), this.onChangeBuffStack);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CHAOS_BOLT), this.onDamage);
  }

  onChangeBuffStack(event) {
    if (event.newStacks === 0) {
      this.casts.push(this._currentStacks);
      this._currentStacks = 0;
    } else {
      this._currentStacks = event.newStacks;
    }
  }

  onDamage(event) {
    this.damage += calculateEffectiveDamage(event, this._currentStacks * BONUS_DAMAGE_PER_STACK);
  }

  get averageStacks() {
    return (this.casts.reduce((total, current) => total + current, 0) / this.casts.length) || 0;
  }

  get dps() {
    return this.damage / this.owner.fightDuration * 1000;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`Bonus Chaos Bolt damage: ${formatThousands(this.damage)}`}
      >
        <BoringSpellValueText spell={SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT}>
          {formatNumber(this.dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % of total</small> <br />
          {this.averageStacks.toFixed(2)} <small>average stacks</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GrimoireOfSupremacy;
