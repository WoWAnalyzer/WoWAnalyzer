import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SpellLink from 'common/SpellLink';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

const BUFFER = 100;
const debug = false;

class Cataclysm extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  _castTimestamp = null;
  _currentCastCount = 0;
  casts = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CATACLYSM_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.CATACLYSM_TALENT.id) {
      return;
    }
    if (this._castTimestamp !== null) {
      // we've casted Cataclysm at least once, so we should add the current (at this time the previous) cast first before resetting the counter
      this.casts.push(this._currentCastCount);
    }
    this._castTimestamp = event.timestamp;
    this._currentCastCount = 0;
  }

  _handleImmolate(event) {
    if (event.ability.guid !== SPELLS.IMMOLATE_DEBUFF.id) {
      return;
    }
    if (event.timestamp <= this._castTimestamp + BUFFER) {
      this._currentCastCount += 1;
    }
    else {
      debug && this.log('Immolate debuff applied outside of the 100ms buffer after cast');
    }
  }

  on_byPlayer_applydebuff(event) {
    this._handleImmolate(event);
  }

  on_byPlayer_refreshdebuff(event) {
    this._handleImmolate(event);
  }

  on_finished() {
    // on each cast, the previous one is saved, so the "results" of the last Cataclysm cast in fight aren't saved, so do it on fight end
    this.casts.push(this._currentCastCount);
  }

  subStatistic() {
    const spell = this.abilityTracker.getAbility(SPELLS.CATACLYSM_TALENT.id);
    const damage = spell.damageEffective + spell.damageAbsorbed;
    const averageTargetsHit = (this.casts.reduce((total, current) => total + current, 0) / spell.casts) || 0;
    debug && this.log('Casts array at fight end: ', JSON.parse(JSON.stringify(this.casts)));
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.CATACLYSM_TALENT.id} /> damage</>}
        value={formatThousands(damage)}
        valueTooltip={`${this.owner.formatItemDamageDone(damage)}<br />
          Average targets hit: ${averageTargetsHit.toFixed(2)}`}
      />
    );
  }
}

export default Cataclysm;
