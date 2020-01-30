import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';
import HasteIcon from 'interface/icons/Haste';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import { calculateAzeriteEffects } from 'common/stats';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatPercentage, formatNumber } from 'common/format';

const inTheRhythmStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [haste] = calculateAzeriteEffects(SPELLS.IN_THE_RHYTHM.id, rank);
  obj.haste += haste;
  return obj;
}, {
  haste: 0,
});

const DURATION = 8000;

/** Rapid Fire
 * When Rapid Fire finishes fully channeling, your Haste is increased by 623 for 8 sec.
 *
 * Example log: https://www.warcraftlogs.com/reports/47LJvZ9BgdhR8TXf#fight=43&type=summary&source=16
 */

class InTheRhythm extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  applications = 0;
  lastApplicationTimestamp = 0;
  possibleApplications = 0;
  haste = 0;
  wastedUptime = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.IN_THE_RHYTHM.id);
    if (!this.active) {
      return;
    }
    const { haste } = inTheRhythmStats(this.selectedCombatant.traitsBySpellId[SPELLS.IN_THE_RHYTHM.id]);
    this.haste = haste;

    this.statTracker.add(SPELLS.IN_THE_RHYTHM_BUFF.id, {
      haste,
    });
  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.RAPID_FIRE.id) {
      return;
    }
    this.possibleApplications += 1;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.IN_THE_RHYTHM_BUFF.id) {
      return;
    }
    this.applications += 1;
    this.lastApplicationTimestamp = event.timestamp;
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.IN_THE_RHYTHM_BUFF.id) {
      return;
    }
    this.applications += 1;
    this.wastedUptime += DURATION - (event.timestamp - this.lastApplicationTimestamp);
    this.lastApplicationTimestamp = event.timestamp;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.IN_THE_RHYTHM_BUFF.id) / this.owner.fightDuration;
  }

  get avgHaste() {
    return this.uptime * this.haste;
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="flexible"
        tooltip={(
          <>
            In The Rhythm granted <strong>{this.haste}</strong> Haste for <strong>{formatPercentage(this.uptime)}%</strong> of the fight. <br />
            You lost out on {formatNumber(this.wastedUptime / 1000)} seconds of uptime from refreshing the buff before it expired.
          </>
        )}
        category={'AZERITE_POWERS'}
      >
        <BoringSpellValueText spell={SPELLS.IN_THE_RHYTHM}>
          <>
            {this.applications}/{this.possibleApplications} <small>applications</small><br />
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small> <br />
            <HasteIcon /> {formatNumber(this.avgHaste)} <small>average Haste gained</small>
          </>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }

}

export default InTheRhythm;
