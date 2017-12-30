import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import Wrapper from 'common/Wrapper';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import DamageTracker from 'Parser/Core/Modules/AbilityTracker';

class FirstOfTheDead extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    damageTracker: DamageTracker,
  };

  totalValue = 0;
  valueCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasHands(ITEMS.THE_FIRST_OF_THE_DEAD.id);
  }

  on_toPlayer_energize(event) {
    if (!event.ability) return;
    if (event.resourceChangeType !== RESOURCE_TYPES.COMBO_POINTS) return;
    const buffID = SPELLS.THE_FIRST_OF_THE_DEAD_BUFF.id;
    if (!this.combatants.selected.hasBuff(buffID)) return;

    let baseCp = 0;
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BACKSTAB.id || spellId === SPELLS.GLOOMBLADE_TALENT.id) {
      baseCp += 1;
    } else if (spellId === SPELLS.SHADOWSTRIKE.id) {
      baseCp += 2;
    } else {
      //Not affected by this legendary
      return;
    }

    if (this.combatants.selected.hasBuff(SPELLS.SHADOW_BLADES.id)) baseCp += 1;

    const gain = event.resourceChange;
    const waste = event.waste;

    const delta = gain - waste - baseCp;
    const value = delta > 0 ? delta : 0;

    this.totalValue += value;
    this.valueCasts += value > 0;
  }

  suggestions(when) {
    const symbolsCasts = this.damageTracker.getAbility(SPELLS.SYMBOLS_OF_DEATH.id).casts;
    const noValueShare = 1 - this.valueCasts / symbolsCasts;

    when(noValueShare).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <Wrapper>
            Make sure to gain extra combo points after each <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} /> when you are using <ItemLink id={ITEMS.THE_FIRST_OF_THE_DEAD.id} />.
          </Wrapper>
        )
          .icon(ITEMS.THE_FIRST_OF_THE_DEAD.icon)
          .actual(`You failed to gain extra combo points on ${formatPercentage(actual)} % of Symbols of Death casts`)
          .recommended(`${recommended} is recommended`)
          .regular(recommended + 0.05)
          .major(recommended + 0.1);
      });
  }

  item() {
    const totalPerMinute = (this.totalValue / this.owner.fightDuration) * 1000 * 60;

    return {
      item: ITEMS.THE_FIRST_OF_THE_DEAD,
      result: <Wrapper>{totalPerMinute.toFixed(2)} combo points generated per minute.</Wrapper>,
    };
  }
}

export default FirstOfTheDead;
