import React from 'react';
import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber } from 'common/format';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemHealingDone from 'interface/others/ItemHealingDone';

import StaggerFabricator from '../../core/StaggerFabricator';

/**
 * Staggering Strikes
 *
 * When you Blackout Strike, your Stagger is reduced by X.
 *
 * Example Report: https://www.warcraftlogs.com/reports/vyx6wk2PVZMDfzhK#fight=12&source=11
 */
class StaggeringStrikes extends Analyzer {
  static dependencies = {
    fab: StaggerFabricator,
  };

  // amount of reduction per-cast
  _staggerReduction = 0;
  // total amount removed
  _staggerRemoved = 0;
  _bocCasts = 0;
  _overhealing = 0;

  constructor(...args) {
    super(...args);
    if(!this.selectedCombatant.hasTrait(SPELLS.STAGGERING_STRIKES.id)) {
      this.active = false;
      return;
    }

    this._staggerReduction = this.selectedCombatant.traitsBySpellId[SPELLS.STAGGERING_STRIKES.id]
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.STAGGERING_STRIKES.id, rank)[0], 0);
  }

  on_byPlayer_cast(event) {
    if(event.ability.guid !== SPELLS.BLACKOUT_STRIKE.id) {
      return;
    }
    
    this._bocCasts += 1;
    const actual = this.fab.removeStagger(event, this._staggerReduction);
    this._staggerRemoved += actual;
    this._overhealing += this._staggerReduction - actual;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.STAGGERING_STRIKES.id}
        value={(
          <ItemHealingDone amount={this._staggerRemoved} />
        )}
        tooltip={`Your Blackout Strike casts each remove ${formatNumber(this._staggerReduction)} staggered damage.
            
            A total of ${this._bocCasts} casts removed ${formatNumber(this._staggerRemoved)} staggered damage (${formatNumber(this._overhealing)} overhealed).`}
      />
    );
  }
}

export default StaggeringStrikes;
