import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { formatNumber } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { CastEvent } from 'parser/core/Events';

const COOLDOWN_REDUCTION_MS = 3000;

/**
 * Casting Arcane Shot or Multi-Shot reduces the cooldown of Trueshot by 3.0 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/9Ljy6fh1TtCDHXVB#fight=2&type=summary&source=25
 */
class CallingTheShots extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  effectiveTrueshotReductionMs = 0;
  wastedTrueshotReductionMs = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CALLING_THE_SHOTS_TALENT.id);
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ARCANE_SHOT.id && spellId !== SPELLS.MULTISHOT_MM.id) {
      return;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.TRUESHOT.id)) {
      if (this.spellUsable.cooldownRemaining(SPELLS.TRUESHOT.id) < COOLDOWN_REDUCTION_MS) {
        const effectiveReductionMs = this.spellUsable.reduceCooldown(SPELLS.TRUESHOT.id, COOLDOWN_REDUCTION_MS);
        this.effectiveTrueshotReductionMs += effectiveReductionMs;
        this.wastedTrueshotReductionMs += (COOLDOWN_REDUCTION_MS - effectiveReductionMs);
      } else {
        this.effectiveTrueshotReductionMs += this.spellUsable.reduceCooldown(SPELLS.TRUESHOT.id, COOLDOWN_REDUCTION_MS);
      }
    } else {
      this.wastedTrueshotReductionMs += COOLDOWN_REDUCTION_MS;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={'TALENTS'}
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
