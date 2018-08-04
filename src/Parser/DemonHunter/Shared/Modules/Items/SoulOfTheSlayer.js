import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import SPECS from 'Game/SPECS';
import Analyzer from 'Parser/Core/Analyzer';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

const debug = false;

/**
 * Equip: Gain one of the following talents based on your specialization:
 * Havoc: First Blood
 * Vengeance: Fallout
 */
class SoulOfTheSlayer extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_SLAYER.id);
    //Checks which spec has the ring equipped and then sets option1 or option2 accordingly - aswell as sets up the check for if they've picked another talent
    switch (this.selectedCombatant.spec) {
      case SPECS.HAVOC_DEMON_HUNTER:
        this.talentGained = SPELLS.FIRST_BLOOD_TALENT.id;
        // REMOVED OPTION 1 AND 2
        break;
      case SPECS.VENGEANCE_DEMON_HUNTER:
        this.talentGained = SPELLS.FALLOUT_TALENT.id;
        this.option1 = SPELLS.FEAST_OF_SOULS_TALENT.id;
        this.option2 = SPELLS.BURNING_ALIVE_TALENT.id;
        break;
      default:
        debug && console.log(' NO SPEC DETECTED');
        break;
    }
    this.hasPickedOtherTalent = this.selectedCombatant.hasTalent(this.option1) || this.selectedCombatant.hasTalent(this.option2);
  }

  item() {
    return {
      item: ITEMS.SOUL_OF_THE_SLAYER,
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
      return suggest(<React.Fragment>When using <ItemLink id={ITEMS.SOUL_OF_THE_SLAYER.id} /> please make sure to pick another talent in the talent row. Your choices are <SpellLink id={this.option1} /> or <SpellLink id={this.option2} />.</React.Fragment>)
        .icon(ITEMS.SOUL_OF_THE_SLAYER.icon)
        .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
    });
  }
}

export default SoulOfTheSlayer;
