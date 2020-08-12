import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { formatNumber } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events from 'parser/core/Events';
import { CTS_CDR_MS } from 'parser/hunter/marksmanship/constants';

/**
 * Casting Arcane Shot, Chimaera Shot or Multi-Shot reduces the cooldown of Trueshot by 2.5 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/9Ljy6fh1TtCDHXVB#fight=2&type=summary&source=25
 *
 * TODO: Verify if you can actually proc Calling The Shots twice off Chimaera Shot
 */
class CallingTheShots extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveTrueshotReductionMs = 0;
  wastedTrueshotReductionMs = 0;

  protected spellUsable!: SpellUsable;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CALLING_THE_SHOTS_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.ARCANE_SHOT, SPELLS.MULTISHOT_MM, SPELLS.CHIMAERA_SHOT_MM_TALENT]), this.onCast);
  }

  onCast() {
    if (this.spellUsable.isOnCooldown(SPELLS.TRUESHOT.id)) {
      if (this.spellUsable.cooldownRemaining(SPELLS.TRUESHOT.id) < CTS_CDR_MS) {
        const effectiveReductionMs = this.spellUsable.reduceCooldown(SPELLS.TRUESHOT.id, CTS_CDR_MS);
        this.effectiveTrueshotReductionMs += effectiveReductionMs;
        this.wastedTrueshotReductionMs += (CTS_CDR_MS - effectiveReductionMs);
      } else {
        this.effectiveTrueshotReductionMs += this.spellUsable.reduceCooldown(SPELLS.TRUESHOT.id, CTS_CDR_MS);
      }
    } else {
      this.wastedTrueshotReductionMs += CTS_CDR_MS;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.CALLING_THE_SHOTS_TALENT}>
          <>
            {formatNumber(this.effectiveTrueshotReductionMs / 1000)}s / {formatNumber((this.effectiveTrueshotReductionMs + this.wastedTrueshotReductionMs) / 1000)}s <small>CDR</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CallingTheShots;
