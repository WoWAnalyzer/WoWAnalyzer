import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText
  from 'interface/statistics/components/BoringSpellValueText';
import { ApplyDebuffEvent } from '../../../../core/Events';

/**
 * Fires a magical projectile, tethering the enemy and any other enemies within
 * 5 yards for 10 sec, rooting them in place for 5 sec if they move more than 5
 * yards from the arrow. Example log:
 * https://www.warcraftlogs.com/reports/qZRdFv9Apg74wmMV#fight=3&type=damage-done
 */

class BindingShot extends Analyzer {

  _roots = 0;
  _applications = 0;

  constructor(options: any) {
    super(options);
    this.active
      = this.selectedCombatant.hasTalent(SPELLS.BINDING_SHOT_TALENT.id);
  }

  on_byPlayer_applydebuff(event: ApplyDebuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !==
      SPELLS.BINDING_SHOT_ROOT.id &&
      spellId !==
      SPELLS.BINDING_SHOT_TETHER.id) {
      return;
    }
    if (spellId === SPELLS.BINDING_SHOT_ROOT.id) {
      this._roots += 1;
    }
    if (spellId === SPELLS.BINDING_SHOT_TETHER.id) {
      this._applications += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={'TALENTS'}
      >
        <BoringSpellValueText spell={SPELLS.BINDING_SHOT_TALENT}>
          <>
            {this._roots} <small>roots</small> / {this._applications}
            <small>possible</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BindingShot;
