import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatThousands } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

// the application of the debuff (and first tick of damage) is instant after the cast, but seems to have a little bit of leeway across multiple enemies
// this example log: /report/mvK3PYrbcwfj9qTG/15-LFR+Zul+-+Kill+(3:49)/16-Residentevil shows around +15ms, so setting 100ms buffer to account for lags
const BUFFER = 100;
const debug = false;

class VileTaint extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  _castTimestamp = null;
  _currentCastCount = 0;
  casts = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.VILE_TAINT_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VILE_TAINT_TALENT), this.onVileTaintCast);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.VILE_TAINT_TALENT), this.onVileTaintApplyDebuff);
    this.addEventListener(Events.fightend, this.onFinished);
  }

  onVileTaintCast(event) {
    if (this._castTimestamp !== null) {
      // we've casted VT at least once, so we should add the current (at this time the previous) cast first before resetting the counter
      this.casts.push(this._currentCastCount);
    }
    this._castTimestamp = event.timestamp;
    this._currentCastCount = 0;
  }

  onVileTaintApplyDebuff(event) {
    if (event.timestamp <= this._castTimestamp + BUFFER) {
      this._currentCastCount += 1;
    }
    else {
      debug && console.log('Vile Taint debuff applied outside of the 100ms buffer after cast');
    }
  }

  onFinished() {
    // on each cast, the previous one is saved, so the "results" of the last VT cast in fight aren't saved, so do it on fight end
    this.casts.push(this._currentCastCount);
  }

  subStatistic() {
    const spell = this.abilityTracker.getAbility(SPELLS.VILE_TAINT_TALENT.id);
    const damage = spell.damageEffective + spell.damageAbsorbed;
    const averageTargetsHit = (this.casts.reduce((total, current) => total + current, 0) / spell.casts) || 0;
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.VILE_TAINT_TALENT.id} /> damage</>}
        value={this.owner.formatItemDamageDone(damage)}
        valueTooltip={`${formatThousands(damage)} damage<br />
          Average targets hit: ${averageTargetsHit.toFixed(2)}`}
      />
    );
  }
}

export default VileTaint;
