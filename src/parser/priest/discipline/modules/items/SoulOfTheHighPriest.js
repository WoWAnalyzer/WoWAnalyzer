import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import Analyzer from 'parser/core/Analyzer';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

class SoulOfTheHighPriest extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_HIGH_PRIEST.id);
    this.hasPickedOtherTalent = this.selectedCombatant.hasTalent(SPELLS.CASTIGATION_TALENT.id) || 
                                this.selectedCombatant.hasTalent(SPELLS.SCHISM_TALENT.id);
  }

  item() {
    return {
      item: ITEMS.SOUL_OF_THE_HIGH_PRIEST,
      result: <>This gave you <SpellLink id={SPELLS.TWIST_OF_FATE_TALENT_DISCIPLINE.id} />.</>,
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
