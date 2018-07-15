import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import AstralPowerTracker from '../ResourceTracker/AstralPowerTracker';

/*
 * The cooldown reduction itself is handled in ./ResourceTracker/AstralPowerTracker
 */
class ImpeccableFelEssence extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    astralPowerTracker: AstralPowerTracker,
  };

  cooldownID;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasFinger(ITEMS.IMPECCABLE_FEL_ESSENCE.id);
    if (this.selectedCombatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id)){
      this.cooldownID = SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id;
    } else {
      this.cooldownID = SPELLS.CELESTIAL_ALIGNMENT.id;
    }
  }

  item() {
    return {
      item: ITEMS.IMPECCABLE_FEL_ESSENCE,
      result:(
        <dfn data-tip={`You wasted ${formatNumber(this.astralPowerTracker.cooldownReductionWasted / 1000)} seconds of cooldown reduction.`}>
          <React.Fragment>Reduced the cooldown of <SpellLink id={this.cooldownID} /> by a total of {formatNumber( this.astralPowerTracker.cooldownReduction / 1000)} seconds.</React.Fragment>
        </dfn>
      ),
    };
  }
}

export default ImpeccableFelEssence;
