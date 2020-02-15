import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';
import AgilityIcon from 'interface/icons/Agility';
import UptimeIcon from 'interface/icons/Uptime';
import BoringSpellValueText
  from 'interface/statistics/components/BoringSpellValueText';
import Statistic from '../../../../../../interface/statistics/Statistic';
import Combatant from '../../../../../core/Combatant';

const hazeOfRageStats = (traits: number[]) => Object.values(traits).reduce((
  obj,
  rank,
) => {
  const [agility] = calculateAzeriteEffects(SPELLS.HAZE_OF_RAGE.id, rank);
  obj.agility += agility;
  return obj;
}, {
  agility: 0,
});

export const STAT_TRACKER = {
  agility: (combatant: Combatant) => hazeOfRageStats(combatant.traitsBySpellId[SPELLS.HAZE_OF_RAGE.id]).agility,
};

/**
 * Bestial Wrath increases your Agility by 376 for 8 sec.
 *
 * Example report:
 * https://www.warcraftlogs.com/reports/9mWQv1XZJT8M6GBV#fight=1&type=damage-done
 */
class HazeOfRage extends Analyzer {
  agility = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.HAZE_OF_RAGE.id);
    if (!this.active) {
      return;
    }
    const { agility } = hazeOfRageStats(this.selectedCombatant.traitsBySpellId[SPELLS.HAZE_OF_RAGE.id]);
    this.agility = agility;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.HAZE_OF_RAGE_BUFF.id) /
      this.owner.fightDuration;
  }

  get avgAgility() {
    return this.uptime * this.agility;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={'AZERITE_POWERS'}
        tooltip={(
          <>
            Haze of Rage granted <strong>{this.agility}</strong> Agility for <strong>{formatPercentage(
            this.uptime)}%</strong> of the fight.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.HAZE_OF_RAGE}>
          <>
            <AgilityIcon /> {formatNumber(this.avgAgility)}
            <small> average Agility gained</small><br />
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HazeOfRage;
