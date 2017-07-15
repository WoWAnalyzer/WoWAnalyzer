import React from 'react';

import SPELLS from 'common/SPELLS';
import makeWclUrl from 'common/makeWclUrl';
import SpellIcon from 'common/SpellIcon';
import { formatThousands, formatNumber } from 'common/format';

import LazyLoadStatisticBox from 'Main/LazyLoadStatisticBox';

import ModuleComponent from 'Parser/Core/ModuleComponent';

const POWER_WORD_BARRIER_REDUCTION = 0.25;

class PowerWordBarrier extends ModuleComponent {

  get damageReducedDuringPowerWordBarrier() {
    return this.state.totalDamageTakenDuringPWB / (1 - POWER_WORD_BARRIER_REDUCTION) * POWER_WORD_BARRIER_REDUCTION;
  }

  get damageReduced() {
    return this.damageReducedDuringPowerWordBarrier;
  }

  constructor(props) {
    super(props);
    this.state = {
      active: true,
      totalDamageTakenDuringPWB: 0,
    };
  }

  load() {
    const damageTakenPromise = fetch(makeWclUrl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `IN RANGE FROM type='applybuff' AND ability.id=${SPELLS.POWER_WORD_BARRIER_BUFF.id} TO type='removebuff' AND ability.id=${SPELLS.POWER_WORD_BARRIER_BUFF.id} GROUP BY target ON target END`,
    }))
      .then(response => response.json())
      .then((json) => {
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else {
          this.setState({
            totalDamageTakenDuringPWB: json.entries.reduce((damageTaken, entry) => damageTaken + entry.total, 0),
          });
        }
      });
    
    return damageTakenPromise;
  }

  render() {
    if (!this.active) {
      return null;
    }
    const fightDuration = this.owner.fightDuration;

    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.POWER_WORD_BARRIER_BUFF.id} />}
        value={`±${formatNumber(this.damageReducedDuringPowerWordBarrier / fightDuration * 1000)} EHPS`}
        label="Barrier EHPS"
        tooltip={
          `The total effective health granted by Power Word: Barrier was ${formatThousands(this.damageReducedDuringPowerWordBarrier)} (${formatNumber(this.damageReducedDuringPowerWordBarrier / fightDuration * 1000)} EHPS). This includes values from other priests in your raid due to technical limitations.`

        }
      />
    );
  }
}

export default PowerWordBarrier;
