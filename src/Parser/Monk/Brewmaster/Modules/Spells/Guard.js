import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import StaggerFabricator from '../Core/StaggerFabricator';

const GUARD_DURATION = 15000;
const GUARD_REMOVESTAGGER_REASON = {
  type: 'absorbed',
  ability: {
    guid: SPELLS.GUARD_TALENT.id,
    name: SPELLS.GUARD_TALENT.name,
    icon: SPELLS.GUARD_TALENT.icon,
  },
  __fabricated: true,
};

class Guard extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    fab: StaggerFabricator,
  };

  _guardSizes = [];
  _absorbed = 0;
  _guardWasted = 0;
  _guardRemaining = 0;
  _lastApplication = 0;

  get _hasGuard() {
    return this.combatants.selected.hasBuff(SPELLS.GUARD_TALENT.id);
  }

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.GUARD_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    if(event.ability.guid !== SPELLS.GUARD_TALENT.id) {
      return;
    }
    this._guardSizes.push(event.absorb || 0);
    this._guardRemaining = event.absorb || 0;
  }

  on_byPlayer_removebuff(event) {
    if(event.ability.guid !== SPELLS.GUARD_TALENT.id) {
      return;
    }

    if(event.timestamp - this._lastApplication >= GUARD_DURATION) {
      // almost certainly natural buff expiration, any remaining guard
      // is wasted
      this._guardWasted += this._guardRemaining;
      this._guardRemaining = 0;
    }
    this._lastApplication = 0;
  }

  on_byPlayer_absorbed(event) {
    if(event.ability.guid !== SPELLS.STAGGER.id) {
      return;
    }
    if(!this._hasGuard && this._guardRemaining === 0) {
      // sequencing issue with the log:
      // guard buff is removed before the absorb that removes it, so we
      // check for there being guard left over (see
      // `on_byPlayer_removebuff`)
      return;
    }

    this._guardRemaining -= event.amount;
    let leftOverDamage = 0;
    if(this._guardRemaining < 0) {
      leftOverDamage = -this._guardRemaining;
      this._guardRemaining = 0;
    }

    const amountAbsorbed = event.amount - leftOverDamage;
    this._absorbed += amountAbsorbed;
    const reason = {
      timestamp: event.timestamp,
      amount: amountAbsorbed,
      __reason: event,
      ...GUARD_REMOVESTAGGER_REASON,
    };
    this.fab.removeStagger(reason, amountAbsorbed);
  }

  statistic() {
    const avgGuardSize = this._guardSizes.reduce((v, sum) => sum + v, 0) / this._guardSizes.length;
    const aps = this._absorbed / (this.owner.fightDuration / 1000);
    return <StatisticBox
      icon={<SpellIcon id={SPELLS.GUARD_TALENT.id} />}
      value={`${formatNumber(aps)} DTPS`}
      label={"Effective Mitigation by Guard"}
      tooltip={`Your average Guard could absorb up to <b>${formatNumber(avgGuardSize)}</b> damage.<br/>
                You wasted <b>${formatNumber(this._guardWasted)}</b> of Guard's absorb.<br/>
                Your Guard absorbed a total of <b>${formatNumber(this._absorbed)}</b> damage.`}
              />;
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();

}

export default Guard;
