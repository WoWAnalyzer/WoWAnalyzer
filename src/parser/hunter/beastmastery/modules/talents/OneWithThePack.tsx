import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import HIT_TYPES from 'game/HIT_TYPES';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';

/**
 * Wild Call has a 20% increased chance to reset the cooldown of Barbed Shot.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/y8RkxqLapwWhBAjT#fight=6&type=damage-done&source=142
 *
 * Wild Call: Your auto shot critical strikes have a 20% chance to reset the cooldown of Barbed Shot.
 */
const WILD_CALL_RESET_PERCENT = 0.2;

class OneWithThePack extends Analyzer {

  procChances = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ONE_WITH_THE_PACK_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.AUTO_SHOT), this.onAutoShotDamage);
  }

  onAutoShotDamage(event: DamageEvent) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    this.procChances += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            Since there is no way to track Wild Call resets, this is an approximation of how many resets One With The Pack granted you.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.ONE_WITH_THE_PACK_TALENT}>
          <>
            ≈{(this.procChances * WILD_CALL_RESET_PERCENT).toFixed(1)} <small>resets</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default OneWithThePack;
