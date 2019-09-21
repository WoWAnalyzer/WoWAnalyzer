import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Haste from 'interface/icons/Haste';
import UptimeIcon from 'interface/icons/Uptime';

const HASTE_PER_PERCENT = 68;
const DIRE_BEAST_HASTE_BUFF_PERCENT = 5;

/**
 * Kill Command deals n additional damage, and has a chance to summon a Dire Beast.
 *
 * Example report:
 * https://www.warcraftlogs.com/reports/hqJFrknaDMRHmtWj/#fight=27&type=damage-done - SV
 * https://www.warcraftlogs.com/reports/6j2JbBTKMXYVy4mA#fight=7&type=damage-done - BM
 */
class DireConsequences extends Analyzer {
  procs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.DIRE_CONSEQUENCES.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.DIRE_BEAST_BUFF.id) / this.owner.fightDuration;
  }

  get avgHaste() {
    return this.uptime * (this.procs * DIRE_BEAST_HASTE_BUFF_PERCENT * HASTE_PER_PERCENT);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DIRE_BEAST_BUFF.id) {
      return;
    }
    this.procs++;
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="flexible"
        category={'AZERITE_POWERS'}
      >
        <BoringSpellValueText spell={SPELLS.DIRE_CONSEQUENCES}>
          <>
            <Haste /> {formatNumber(this.avgHaste)} <small>average Haste</small><br />
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small> <br />
            {this.procs} <small>procs</small>
          </>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default DireConsequences;
