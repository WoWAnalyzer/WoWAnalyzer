import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import SPECS from 'common/SPECS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

const debug = false;

class SoulOfTheArchdruid extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_ARCHDRUID.id);

    switch (this.combatants.selected.spec) {
      case SPECS.BALANCE_DRUID:
        this.talentGained = SPELLS.SOUL_OF_THE_FOREST_TALENT_BALANCE.id;
        this.option1 = SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id;
        this.option2 = SPELLS.STELLAR_FLARE_TALENT.id;
        break;
      case SPECS.FERAL_DRUID:
        this.talentGained = SPELLS.SOUL_OF_THE_FOREST_TALENT_FERAL.id;
        this.option1 = SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id;
        this.option2 = SPELLS.JAGGED_WOUNDS_TALENT.id;
        break;
      case SPECS.GUARDIAN_DRUID:
        this.talentGained = SPELLS.SOUL_OF_THE_FOREST_TALENT_GUARDIAN.id;
        this.option1 = SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id;
        this.option2 = SPELLS.GALACTIC_GUARDIAN_TALENT.id;
        break;
      case SPECS.RESTORATION_DRUID:
        this.talentGained = SPELLS.SOUL_OF_THE_FOREST_TALENT_RESTORATION.id;
        this.option1 = SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id;
        this.option2 = SPELLS.CULTIVATION_TALENT.id;
        break;
      default:
        debug && console.log(' NO SPEC DETECTED');
        break;
    }
    this.hasPickedOtherTalent = this.combatants.selected.hasTalent(this.option1) || this.combatants.selected.hasTalent(this.option2);
  }

  item() {
    return {
      item: ITEMS.SOUL_OF_THE_ARCHDRUID,
      result: <React.Fragment>This gave you <SpellLink id={this.talentGained} />.</React.Fragment>,
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
      return suggest(<React.Fragment>When using <ItemLink id={ITEMS.SOUL_OF_THE_ARCHDRUID.id} /> please make sure to pick another talent in the talent row. Your choices are <SpellLink id={this.option1} /> or <SpellLink id={this.option2} />.</React.Fragment>)
        .icon(ITEMS.SOUL_OF_THE_ARCHDRUID.icon)
        .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
    });
  }
}

export default SoulOfTheArchdruid;
