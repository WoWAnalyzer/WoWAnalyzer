import React from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Events from 'parser/core/Events';
import { SCENT_OF_BLOOD_BARBED_SHOT_RECHARGE } from '@wowanalyzer/hunter-beastmastery/src/constants';

import SpellUsable from '../core/SpellUsable';

/**
 * Activating Bestial Wrath grants 2 charges of Barbed Shot.
 *
 * Example log:
 */

class ScentOfBlood extends Analyzer {

  static dependencies = {
    spellUsable: SpellUsable,
  };

  chargesGained = 0;
  chargesWasted = 0;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SCENT_OF_BLOOD_TALENT.id);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BESTIAL_WRATH), this.bestialWrathApplication);
  }

  bestialWrathApplication() {
    const chargesAvailable = this.spellUsable.chargesAvailable(SPELLS.BARBED_SHOT.id);
    this.chargesGained += SCENT_OF_BLOOD_BARBED_SHOT_RECHARGE - chargesAvailable;
    this.chargesWasted += chargesAvailable;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.SCENT_OF_BLOOD_TALENT}>
          <>
            {this.chargesGained}/{this.chargesGained + this.chargesWasted} <small>charges gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ScentOfBlood;
