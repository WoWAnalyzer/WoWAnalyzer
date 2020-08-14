import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import { MS_BUFFER } from 'parser/hunter/shared/constants';
import { LETHAL_SHOTS_CHANCE, LETHAL_SHOTS_REDUCTION } from 'parser/hunter/marksmanship/constants';

/**
 * Arcane Shot, Chimaera Shot and Multi-Shot have a 30% chance to reduce the cooldown of Rapid Fire by 5.0 sec.
 *
 * Example log:
 *
 */
class LethalShots extends Analyzer {

  procChances: number = 0;
  lastMultiHit: number = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LETHAL_SHOTS_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.ARCANE_SHOT, SPELLS.CHIMAERA_SHOT_FROST_DAMAGE, SPELLS.CHIMAERA_SHOT_NATURE_DAMAGE]), this.onPotentialProc);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MULTISHOT_MM), this.multiShotCheck);
  }

  multiShotCheck(event: DamageEvent) {
    if (event.timestamp > this.lastMultiHit + MS_BUFFER) {
      this.lastMultiHit = event.timestamp;
      this.onPotentialProc();
    }
  }

  onPotentialProc() {
    this.procChances += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.LETHAL_SHOTS_TALENT}>
          <>
            ≈{(Math.round(this.procChances * LETHAL_SHOTS_CHANCE) * (LETHAL_SHOTS_REDUCTION / 1000)).toFixed(1)}s <small> potential Rapid Fire CDR</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default LethalShots;
