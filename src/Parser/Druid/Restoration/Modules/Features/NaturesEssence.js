import React from 'react';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';

const MINOR = 0.07;
const AVERAGE = 0.12;
const MAJOR = 0.17;

class NaturesEssence extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  effectiveHealing = 0;
  overHealing = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.NATURES_ESSENCE_TRAIT.id] > 0;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (SPELLS.NATURES_ESSENCE_DRUID.id === spellId) {
      this.effectiveHealing += event.amount + (event.absorbed || 0);
      this.overHealing += (event.overheal !== undefined ? event.overheal : 0);
    }
  }

  suggestions(when) {
    const overhealPercent = (this.overHealing + this.effectiveHealing !== 0)
        ? this.overHealing / (this.effectiveHealing + this.overHealing)
        : 0;

    when(overhealPercent).isGreaterThan(MINOR)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your overhealing from <SpellLink id={SPELLS.NATURES_ESSENCE_DRUID.id} /> is high.
          You may be casting <SpellLink id={SPELLS.WILD_GROWTH.id} /> when few raiders are injured, or you may be casting it before damage.
          Unlike our other HoTs, <SpellLink id={SPELLS.WILD_GROWTH.id} /> heals quickly and has a strong initial heal,
          so you should wait until damage has already happened to cast it.</span>)
          .icon(SPELLS.NATURES_ESSENCE_DRUID.icon)
          .actual(`${formatPercentage(overhealPercent)}% overhealing`)
          .recommended(`<${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(AVERAGE).major(MAJOR);
      });
  }
}

export default NaturesEssence;
