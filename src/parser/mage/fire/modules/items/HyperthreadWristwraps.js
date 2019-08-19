import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const debug = false;

class HyperthreadWristwraps extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
    enemies: EnemyInstances,
  };

  lastThreeSpells = [];
  fireBlastReductions = 0;
  badWristUse = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasWrists(ITEMS.HYPERTHREAD_WRISTWRAPS.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onSpellCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HYPERTHREAD_WRISTWRAPS_CAST), this.onWristUse);
  }

  onSpellCast(event) {
    if (event.ability.guid === SPELLS.HYPERTHREAD_WRISTWRAPS_CAST.id) {
      return;
    }

    if (this.lastThreeSpells.length === 3) {
      this.lastThreeSpells.shift();
    }
    this.lastThreeSpells.push(event.ability.guid);
  }

  onWristUse(event) {
    debug && console.log(this.lastThreeSpells);
    this.lastThreeSpells.forEach(spell => {
      if (spell === SPELLS.FIRE_BLAST.id) {
        this.fireBlastReductions += 1;
      }
      if (this.spellUsable.isOnCooldown(spell)) {
        debug && this.log('Reduced ' + spell + ' by 5 seconds.');
        this.spellUsable.reduceCooldown(spell,5000);
      }
    });
    if (this.fireBlastReductions !== 2) {
      this.badWristUse += 1;
    }
    this.fireBlastReductions = 0;
  }

  get wristEfficiency() {
    return 1 - (this.badWristUse / this.abilityTracker.getAbility(SPELLS.HYPERTHREAD_WRISTWRAPS_CAST.id).casts);
  }

  get suggestionThresholds() {
    return {
      actual: this.wristEfficiency,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
		when(this.suggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<>You used your <ItemLink id={ITEMS.HYPERTHREAD_WRISTWRAPS.id} /> improperly {this.badWristUse} times. In order to get the most out of the item, you should ensure that you are reducing <SpellLink id={SPELLS.FIRE_BLAST.id} /> twice per use. To accomplish this, you should cast <SpellLink id={SPELLS.FIRE_BLAST.id} /> > <SpellLink id={SPELLS.PYROBLAST.id} /> > <SpellLink id={SPELLS.FIRE_BLAST.id} /> > <ItemLink id={ITEMS.HYPERTHREAD_WRISTWRAPS.id} />. That way <SpellLink id={SPELLS.FIRE_BLAST.id} /> gets reduced twice.</>)
					.icon(ITEMS.HYPERTHREAD_WRISTWRAPS.icon)
					.actual(`${formatPercentage(this.wristEfficiency)}% Utilization`)
					.recommended(`<${formatPercentage(recommended)}% is recommended`);
			});
	}
}

export default HyperthreadWristwraps;
