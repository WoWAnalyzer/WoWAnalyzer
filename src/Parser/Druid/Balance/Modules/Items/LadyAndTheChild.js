import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import { formatNumber , formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Wrapper from 'common/Wrapper';

class LadyAndTheChild extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  moonfireCasts = 0;
  moonfireHits = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.LADY_AND_THE_CHILD.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.MOONFIRE_BEAR.id || event.tick === true) {
      return;
    }
      this.moonfireHits++;
  }
  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.MOONFIRE.id) {
      return;
    }
      this.moonfireCasts++;
  }

  get percentTwoHits() {
    return (this.moonfireHits - this.moonfireCasts) / this.moonfireCasts;
  }

  item() {
    return {
      item: ITEMS.LADY_AND_THE_CHILD,
      result: (
        <dfn data-tip={`You hit ${this.moonfireHits} times with ${this.moonfireCasts} casts.`}>
          <Wrapper>{formatPercentage(this.percentTwoHits)}% of your <SpellLink id={SPELLS.MOONFIRE_BEAR.id}/> casts hit two targets.</Wrapper>
        </dfn>
      ),
    };
  }
}

export default LadyAndTheChild;
