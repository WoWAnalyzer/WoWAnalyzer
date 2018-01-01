import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import Wrapper from 'common/Wrapper';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

class SoulOfTheHighPriest extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HIGH_PRIEST.id);
    this.hasPickedOtherTalent = this.combatants.selected.hasTalent(SPELLS.CASTIGATION_TALENT.id) || 
                                this.combatants.selected.hasTalent(SPELLS.SCHISM_TALENT.id);
  }

  item() {
    return {
      item: ITEMS.SOUL_OF_THE_HIGH_PRIEST,
      result: <Wrapper>This gave you <SpellLink id={SPELLS.TWIST_OF_FATE_TALENT.id} />.</Wrapper>,
    };
  }

  suggestions(when) {
    when(this.hasPickedOtherTalent).isFalse()
    .addSuggestion((suggest) => {
      return suggest(<span>When using <ItemLink id={ITEMS.SOUL_OF_THE_HIGH_PRIEST.id} /> please make sure to pick another talent in the same talent row. Your choices are <SpellLink id={SPELLS.CASTIGATION_TALENT.id} /> or <SpellLink id={SPELLS.SCHISM_TALENT.id} />.</span>)
        .icon(ITEMS.SOUL_OF_THE_HIGH_PRIEST.icon)
        .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
    });
  }
}

export default SoulOfTheHighPriest;
