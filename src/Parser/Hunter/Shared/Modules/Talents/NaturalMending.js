import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from 'Interface/Others/StatisticBox';
import { formatNumber } from 'common/format';
import SPECS from 'common/SPECS';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';

/**
 * Every 20 (MM/SV) or 30 (BM) focus you spend reducxes the remaining cooldown of Exhilaration by 1 sec.
 */

const MM_SV_CDR_PER_FOCUS = 1000 / 20;
const BM_CDR_PER_FOCUS = 1000 / 30;

class NaturalMending extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  cdrPerFocus = MM_SV_CDR_PER_FOCUS;
  effectiveExhilReductionMs = 0;
  wastedExhilReductionMs = 0;
  lastFocusCost = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.NATURAL_MENDING_TALENT.id);
    if (this.active) {
      if (this.selectedCombatant.spec === SPECS.BEAST_MASTERY_HUNTER) {
        this.cdrPerFocus = BM_CDR_PER_FOCUS;
      }
    }
  }

  on_byPlayer_cast(event) {
    if (!event || !event.classResources || event.classResources[0].cost === 0) {
      return;
    }
    this.lastFocusCost = event.classResources[0].cost || 0;
    const COOLDOWN_REDUCTION_MS = this.cdrPerFocus * this.lastFocusCost;
    if (this.spellUsable.isOnCooldown(SPELLS.EXHILARATION.id)) {
      if (this.spellUsable.cooldownRemaining(SPELLS.EXHILARATION.id) < COOLDOWN_REDUCTION_MS) {
        const effectiveReductionMs = this.spellUsable.reduceCooldown(SPELLS.EXHILARATION.id, COOLDOWN_REDUCTION_MS);
        this.effectiveExhilReductionMs += effectiveReductionMs;
        this.wastedExhilReductionMs += (COOLDOWN_REDUCTION_MS - effectiveReductionMs);
      } else {
        this.effectiveExhilReductionMs += this.spellUsable.reduceCooldown(SPELLS.EXHILARATION.id, COOLDOWN_REDUCTION_MS);
      }
    } else {
      this.wastedExhilReductionMs += COOLDOWN_REDUCTION_MS;
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.NATURAL_MENDING_TALENT.id} />}
        value={`${formatNumber(this.effectiveExhilReductionMs / 1000)}s`}
        label="Exhilaration CDR"
        tooltip={`You wasted ${formatNumber(this.wastedExhilReductionMs / 1000)} seconds of CDR by spending focus whilst Exhilaration wasn't on cooldown.`} />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(5);

}

export default NaturalMending;
