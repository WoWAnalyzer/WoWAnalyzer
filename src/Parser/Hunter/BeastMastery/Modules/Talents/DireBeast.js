import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import StatisticBox from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';

/**
 * Summons a powerful wild beast that attacks the target and roars, increasing your Haste by 5% for 8 sec.
 *
 * Example log: https://www.warcraftlogs.com/reports/LZz1aHhCkBcm4pNY#fight=6&type=damage-done
 */
class DireBeast extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DIRE_BEAST_TALENT.id);
  }

  get percentUptime() {
    //This calculates the uptime over the course of the encounter of Dire Beast
    return this.selectedCombatant.getBuffUptime(SPELLS.DIRE_BEAST_BUFF.id) / this.owner.fightDuration;
  }
  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(19)}
        icon={<SpellIcon id={SPELLS.DIRE_BEAST_TALENT.id} />}
        value={`${formatPercentage(this.percentUptime)}%`}
        label="Dire Beast uptime"
      />
    );
  }

}

export default DireBeast;
