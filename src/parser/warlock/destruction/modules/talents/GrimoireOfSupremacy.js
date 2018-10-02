import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

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

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<React.Fragment>Average <SpellLink id={SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id} /> stacks</React.Fragment>}
        value={this.averageStacks.toFixed(2)}
        valueTooltip={`Bonus Chaos Bolt damage: ${formatThousands(this.damage)}. Note that due to Destruction Mastery, this is only an estimate (not taking Mastery into account).`}
      />
    );
  }
}

export default GrimoireOfSupremacy;
