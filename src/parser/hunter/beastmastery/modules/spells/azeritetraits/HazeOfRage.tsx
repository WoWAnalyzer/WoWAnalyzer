import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';
import AgilityIcon from 'interface/icons/Agility';
import UptimeIcon from 'interface/icons/Uptime';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import StatTracker from 'parser/shared/modules/StatTracker';


const hazeOfRageStats = (traits: number[]) => Object.values(traits).reduce((obj, rank) => {
  const [agility] = calculateAzeriteEffects(SPELLS.HAZE_OF_RAGE.id, rank);
  obj.agility += agility;
  return obj;
}, {
  agility: 0,
});

/**
 * Bestial Wrath increases your Agility by 376 for 8 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/39yhq8VLFrm7J4wR#fight=17&type=auras&source=8&ability=279810
 */
class HazeOfRage extends Analyzer {

  static dependencies = {
    statTracker: StatTracker,
  };

  agility = 0;

  protected statTracker!: StatTracker;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.HAZE_OF_RAGE.id);
    if (!this.active) {
      return;
    }
    const { agility } = hazeOfRageStats(this.selectedCombatant.traitsBySpellId[SPELLS.HAZE_OF_RAGE.id]);
    this.agility = agility;

    options.statTracker.add(SPELLS.HAZE_OF_RAGE_BUFF.id, {
      agility: this.agility,
    });
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.HAZE_OF_RAGE_BUFF.id) / this.owner.fightDuration;
  }

  get avgAgility() {
    return this.uptime * this.agility;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
        tooltip={(
          <>
            Haze of Rage granted <strong>{formatNumber(this.agility)}</strong> Agility for <strong>{formatPercentage(this.uptime)}%</strong> of the fight.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.HAZE_OF_RAGE}>
          <>
            <AgilityIcon /> {formatNumber(this.avgAgility)} <small>average Agility gained</small><br />
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HazeOfRage;
