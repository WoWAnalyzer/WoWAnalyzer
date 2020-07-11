import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events from 'parser/core/Events';

/**
 * Fires a magical projectile, tethering the enemy and any other enemies within
 * 5 yards for 10 sec, rooting them in place for 5 sec if they move more than 5
 * yards from the arrow. Example log:
 * https://www.warcraftlogs.com/reports/qZRdFv9Apg74wmMV#fight=3&type=damage-done
 */

class BindingShot extends Analyzer {

  _roots = 0;
  _applications = 0;
  _casts = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BINDING_SHOT_TALENT.id);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.BINDING_SHOT_ROOT), this.onRoot);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.BINDING_SHOT_TETHER), this.onTether);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BINDING_SHOT_TALENT), this.onCast);
  }

  onTether() {
    this._applications += 1;
  }

  onRoot() {
    this._roots += 1;
  }

  onCast() {
    this._casts += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.BINDING_SHOT_TALENT}>
          <>
            {this._roots} <small>roots</small> / {this._applications} <small>possible</small> <br />
            {this._casts} <small>casts</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BindingShot;
