import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import Wrapper from 'common/Wrapper';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

class SoulOfTheArchmage extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_ARCHMAGE.id);
    this.hasPickedOtherTalent = this.combatants.selected.hasTalent(SPELLS.ICE_NOVA_TALENT.id) || this.combatants.selected.hasTalent(SPELLS.SPLITTING_ICE_TALENT.id);
  }

  item() {
    return {
      item: ITEMS.SOUL_OF_THE_ARCHMAGE,
      result: <Wrapper>This gave you <SpellLink id={SPELLS.FROZEN_TOUCH_TALENT.id} />.</Wrapper>,
    };
  }

  suggestions(when) {
    when(this.hasPickedOtherTalent).isFalse()
      .addSuggestion((suggest) => {
        return suggest(<span>When using <ItemLink id={ITEMS.SOUL_OF_THE_ARCHMAGE.id} /> please make sure to pick another talent in the same talent row. Your choices are <SpellLink id={SPELLS.ICE_NOVA_TALENT.id} /> or <SpellLink id={SPELLS.SPLITTING_ICE_TALENT.id} />.</span>)
          .icon(ITEMS.SOUL_OF_THE_ARCHMAGE.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
      });
  }
}

export default SoulOfTheArchmage;
