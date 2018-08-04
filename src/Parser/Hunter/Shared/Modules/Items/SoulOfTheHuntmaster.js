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
 * Gain one of the following talents based on your specialization:
 * Beast Mastery: Thrill of the Hunt
 * Marksmanship: Lock and Load
 * Survival: Viper's Venom
 */
class SoulOfTheHuntmaster extends Analyzer {
  hasPickedOtherTalent = false;
  talentGained = 0;
  option1 = 0;
  option2 = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_HUNTMASTER.id);
    //Checks which spec has the ring equipped and then sets option1 or option2 accordingly - aswell as sets up the check for if they've picked another talent
    switch (this.selectedCombatant.spec) {
      case SPECS.MARKSMANSHIP_HUNTER:
        debug && console.log('SPEC DETECTED AS MM');
        this.talentGained = SPELLS.LOCK_AND_LOAD_TALENT.id;
        this.option1 = SPELLS.CALLING_THE_SHOTS_TALENT.id;
        this.option2 = SPELLS.PIERCING_SHOT_TALENT.id;
        break;
      case SPECS.BEAST_MASTERY_HUNTER:
        debug && console.log('SPEC DETECTED AS BM');
        this.talentGained = SPELLS.THRILL_OF_THE_HUNT_TALENT.id;
        this.option1 = SPELLS.VENOMOUS_BITE_TALENT.id;
        this.option2 = SPELLS.A_MURDER_OF_CROWS_TALENT.id;
        break;
      case SPECS.SURVIVAL_HUNTER:
        debug && console.log('SPEC DETECTED AS SV');
        this.talentGained = SPELLS.VIPERS_VENOM_TALENT.id;
        this.option1 = SPELLS.TERMS_OF_ENGAGEMENT_TALENT.id;
        this.option2 = SPELLS.ALPHA_PREDATOR_TALENT.id;
        break;
      default:
        debug && console.log('NO SPEC DETECTED');
        break;
    }
    if (this.selectedCombatant.hasTalent(this.option1) || this.selectedCombatant.hasTalent(this.option2)) {
      this.hasPickedOtherTalent = true;
    }
  }

  item() {
    return {
      item: ITEMS.SOUL_OF_THE_HUNTMASTER,
      result: <React.Fragment>This gave you <SpellLink id={this.talentGained} />.</React.Fragment>,
    };
  }

  get suggestionThreshold() {
    return {
      actual: this.hasPickedOtherTalent,
      isEqual: false,
      style: 'boolean',
    };
  }

  suggestions(when) {
    when(this.suggestionThreshold).addSuggestion((suggest) => {
      return suggest(<React.Fragment>When using <ItemLink id={ITEMS.SOUL_OF_THE_HUNTMASTER.id} /> please make sure to pick another talent in the talent row. Your choices are <SpellLink id={this.option1} /> or <SpellLink id={this.option2} />.</React.Fragment>)
        .icon(ITEMS.SOUL_OF_THE_HUNTMASTER.icon)
        .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
    });
  }
}

export default SoulOfTheHuntmaster;
