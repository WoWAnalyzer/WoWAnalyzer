import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import { formatDuration } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const COOLDOWN_REDUCTION_MS = 3000;

class ThundergodsVigor extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveReduction = 0;
  wastedReduction = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasWaist(ITEMS.THUNDERGODS_VIGOR.id);
  }


  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.THUNDER_CLAP.id) {
      return;
    }

    if(this.spellUsable.isOnCooldown(SPELLS.DEMORALIZING_SHOUT.id)){
      const reductionEffective = this.spellUsable.reduceCooldown(SPELLS.DEMORALIZING_SHOUT.id, COOLDOWN_REDUCTION_MS);
      this.effectiveReduction += reductionEffective;
      this.wastedReduction += COOLDOWN_REDUCTION_MS - reductionEffective;
      return;
    }
      
    this.wastedReduction += COOLDOWN_REDUCTION_MS;
  }


  item() {
    return {
      item: ITEMS.THUNDERGODS_VIGOR,
      result: (
        <dfn data-tip={`${formatDuration(this.wastedReduction / 1000)} minutes wasted`}>
          <>
            Reduced the cooldown of <SpellLink id={SPELLS.DEMORALIZING_SHOUT.id} /> by {formatDuration(this.effectiveReduction / 1000)} minutes
          </>
        </dfn>
      ),
    };
  }
}

export default ThundergodsVigor;
