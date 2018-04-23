import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

class SoulOfTheHighlord extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HIGHLORD.id);
    this.talentGained = SPELLS.DIVINE_PURPOSE_TALENT_RETRIBUTION.id;
    this.option1 = SPELLS.CRUSADE_TALENT.id;
    this.option2 = SPELLS.HOLY_WRATH_TALENT.id;
    this.hasPickedOtherTalent = this.combatants.selected.hasTalent(this.option1) || this.combatants.selected.hasTalent(this.option2);
  }

  item() {
    return {
      item: ITEMS.SOUL_OF_THE_HIGHLORD,
      result: <React.Fragment>This gave you <SpellLink id={this.talentGained} icon/>.</React.Fragment>,
    };
  }

  get suggestionThresholds() {
    return {
      actual: this.hasPickedOtherTalent,
      isEqual: false,
      style: 'boolean',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).isFalse().addSuggestion((suggest) => {
      return suggest(<React.Fragment>When using <ItemLink id={ITEMS.SOUL_OF_THE_HIGHLORD.id} /> please make sure to pick another talent in the talent row. Your choices are <SpellLink id={this.option1} icon/> or <SpellLink id={this.option2} icon/>.</React.Fragment>)
        .icon(ITEMS.SOUL_OF_THE_HIGHLORD.icon)
        .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
    });
  }
}

export default SoulOfTheHighlord;
