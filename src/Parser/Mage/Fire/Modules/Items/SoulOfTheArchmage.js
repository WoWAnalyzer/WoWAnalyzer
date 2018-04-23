import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

class SoulOfTheArchmage extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_ARCHMAGE.id);
    this.hasPickedOtherTalent = this.combatants.selected.hasTalent(SPELLS.ALEXSTRASZAS_FURY_TALENT.id) || this.combatants.selected.hasTalent(SPELLS.CONTROLLED_BURN_TALENT.id);
  }

  item() {
    return {
      item: ITEMS.SOUL_OF_THE_ARCHMAGE,
      result: <React.Fragment>This gave you <SpellLink id={SPELLS.FLAME_ON_TALENT.id} />.</React.Fragment>,
    };
  }

  suggestions(when) {
    when(this.hasPickedOtherTalent).isFalse()
      .addSuggestion((suggest) => {
        return suggest(
          <React.Fragment>
            When using <ItemLink id={ITEMS.SOUL_OF_THE_ARCHMAGE.id} /> please make sure to pick another talent in the same talent row. Your choices are <SpellLink id={SPELLS.ALEXSTRASZAS_FURY_TALENT.id} /> or <SpellLink id={SPELLS.CONTROLLED_BURN_TALENT.id} />.
          </React.Fragment>
        )
          .icon(ITEMS.SOUL_OF_THE_ARCHMAGE.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
      });
  }
}

export default SoulOfTheArchmage;
