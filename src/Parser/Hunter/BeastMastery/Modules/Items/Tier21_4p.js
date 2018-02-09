import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const COOLDOWN_REDUCTION_MS = 3000;

class Tier21_4p extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  effectiveAspectReductionMs = 0;
  wastedAspectReductionMs = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HUNTER_BM_T21_4P_BONUS.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.KILL_COMMAND.id) {
      return;
    }
    const aspectIsOnCooldown = this.spellUsable.isOnCooldown(SPELLS.ASPECT_OF_THE_WILD.id);
    if (aspectIsOnCooldown) {
      const reductionMs = this.spellUsable.reduceCooldown(SPELLS.ASPECT_OF_THE_WILD.id, COOLDOWN_REDUCTION_MS);
      this.effectiveAspectReductionMs += reductionMs;
      this.wastedAspectReductionMs += (COOLDOWN_REDUCTION_MS - reductionMs);
    } else {
      this.wastedAspectReductionMs += COOLDOWN_REDUCTION_MS;
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.HUNTER_BM_T21_4P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_BM_T21_4P_BONUS.id} />,
      title: <SpellLink id={SPELLS.HUNTER_BM_T21_4P_BONUS.id} />,
      result: (
        <dfn data-tip={`You wasted ${formatNumber(this.wastedAspectReductionMs / 1000)} seconds of CDR by using Kill Command when Aspect of the Wild wasn't on cooldown or had less than 3 seconds remaning on CD.`}>
          reduced <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} /> CD by {formatNumber(this.effectiveAspectReductionMs / 1000)}s in total.
        </dfn>
      ),
    };
  }
}

export default Tier21_4p;
