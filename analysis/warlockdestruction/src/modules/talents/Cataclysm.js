import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

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
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CATACLYSM_TALENT), this.onCataclysmCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CATACLYSM_TALENT), this.onCataclysmDamage);
    this.addEventListener(Events.fightend, this.onFinished);
  }

  onCataclysmCast(event) {
    if (this._castTimestamp !== null) {
      // we've casted Cataclysm at least once, so we should add the current (at this time the previous) cast first before resetting the counter
      this.casts.push(this._currentCastCount);
    }
    this._castTimestamp = event.timestamp;
    this._currentCastCount = 0;
  }

  onCataclysmDamage(event) {
    if (event.timestamp <= this._castTimestamp + BUFFER) {
      this._currentCastCount += 1;
    } else {
      debug && this.log('Cataclysm damage outside of the 100ms buffer after cast');
    }
  }

  onFinished() {
    // on each cast, the previous one is saved, so the "results" of the last Cataclysm cast in fight aren't saved, so do it on fight end
    this.casts.push(this._currentCastCount);
  }

  statistic() {
    const spell = this.abilityTracker.getAbility(SPELLS.CATACLYSM_TALENT.id);
    const damage = spell.damageEffective + spell.damageAbsorbed;
    const dps = damage / this.owner.fightDuration * 1000;
    const averageTargetsHit = (this.casts.reduce((total, current) => total + current, 0) / spell.casts) || 0;
    debug && this.log('Casts array at fight end: ', JSON.parse(JSON.stringify(this.casts)));

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(damage)} damage`}
      >
        <BoringSpellValueText spell={SPELLS.CATACLYSM_TALENT}>
          {formatNumber(dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))} % of total</small> <br />
          {averageTargetsHit.toFixed(2)} <small>average targets hit</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Cataclysm;
