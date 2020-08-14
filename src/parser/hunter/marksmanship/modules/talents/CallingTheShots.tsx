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
 *
 * TODO: Currently, Chimaera Shot reduces Trueshot twice if it hits two targets, verify if that is still the case in future builds.
 * If it stays this way, we have a couple of solutions:
 * 1. Simple solution: We might have to use the damage events as we do now, which could give a slight desync compared to actuality
 * 2. We reduce Trueshot CD by one tick on cast (guaranteed), and then by an additional tick if both damage events are detected.
 * 3. We reduce Trueshot CD by 2 ticks on cast, and then increase CD by 1 tick if both damage events don't occur.
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
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.ARCANE_SHOT, SPELLS.MULTISHOT_MM]), this.onCTSPotentialProc);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.CHIMAERA_SHOT_NATURE_DAMAGE, SPELLS.CHIMAERA_SHOT_FROST_DAMAGE]), this.onCTSPotentialProc);
  }

  onCTSPotentialProc() {
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
