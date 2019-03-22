import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

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
  }

  on_byPlayer_changebuffstack(event) {
    if (event.ability.guid !== SPELLS.GRIMOIRE_OF_SUPREMACY_BUFF.id) {
      return;
    }
    if (event.newStacks === 0) {
      this.casts.push(this._currentStacks);
      this._currentStacks = 0;
    } else {
      this._currentStacks = event.newStacks;
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.CHAOS_BOLT.id) {
      return;
    }
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
        position={STATISTIC_ORDER.OPTIONAL(4)}
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
