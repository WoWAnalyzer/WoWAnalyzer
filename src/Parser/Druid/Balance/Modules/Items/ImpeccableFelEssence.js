import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import Wrapper from 'common/Wrapper';
import AstralPowerTracker from '../ResourceTracker/AstralPowerTracker';

/*
 * The cooldown reduction itself is handled in ./ResourceTracker/AstralPowerTracker
 */
class ImpeccableFelEssence extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
    astralPowerTracker: AstralPowerTracker,
  };

  cooldownID;

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.IMPECCABLE_FEL_ESSENCE.id);
    if (this.combatants.selected.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id)){
      this.cooldownID = SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id;
    } else {
      this.cooldownID = SPELLS.CELESTIAL_ALIGNMENT.id;
    }
  }

  item() {
    return {
      item: ITEMS.IMPECCABLE_FEL_ESSENCE,
      result:(
        <dfn data-tip={`You wasted ${formatNumber(this.astralPowerTracker.cooldownReductionWasted / 1000)} seconds of cooldown reduction.<br/> `}>
          <Wrapper>Reduced the cooldown of <SpellLink id={this.cooldownID} /> by a total of {formatNumber( this.astralPowerTracker.cooldownReduction / 1000)} seconds.</Wrapper>
        </dfn>
      ),
    };
  }
}

export default ImpeccableFelEssence;
