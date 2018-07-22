import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import StaggerFabricator from '../Core/StaggerFabricator';

class Guard extends Analyzer {
  static dependencies = {
    fab: StaggerFabricator,
  };

  _guardSizes = [];
  _absorbed = 0;
  _guardWasted = 0;
  _lastApplication = 0;

  get _hasGuard() {
    return this.selectedCombatant.hasBuff(SPELLS.GUARD_TALENT.id);
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GUARD_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    if(event.ability.guid !== SPELLS.GUARD_TALENT.id) {
      return;
    }
    this._guardSizes.push(event.absorb || 0);
  }

  on_byPlayer_removebuff(event) {
    if(event.ability.guid !== SPELLS.GUARD_TALENT.id) {
      return;
    }

    this._guardWasted += event.absorb || 0;
  }

  on_byPlayer_absorbed(event) {
    if(event.ability.guid !== SPELLS.GUARD_TALENT.id) {
      return;
    }

    this._absorbed += event.amount;
  }

  statistic() {
    const avgGuardSize = this._guardSizes.reduce((v, sum) => sum + v, 0) / this._guardSizes.length;
    const aps = this._absorbed / (this.owner.fightDuration / 1000);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GUARD_TALENT.id} />}
        value={`${formatNumber(aps)} DTPS`}
        label={"Effective Mitigation by Guard"}
        tooltip={`Your average Guard could absorb up to <b>${formatNumber(avgGuardSize)}</b> damage.<br/>
                  You wasted <b>${formatNumber(this._guardWasted)}</b> of Guard's absorb.<br/>
                  Your Guard absorbed a total of <b>${formatNumber(this._absorbed)}</b> damage.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();

}

export default Guard;
