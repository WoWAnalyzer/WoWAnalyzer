import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS/index';
import StatTracker from 'parser/shared/modules/StatTracker';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Agility from 'interface/icons/Agility';
import UptimeIcon from 'interface/icons/Uptime';

const danceOfDeathStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [agility] = calculateAzeriteEffects(SPELLS.DANCE_OF_DEATH.id, rank);
  obj.agility += agility;
  obj.agility *= 1.2; //Hotfix from 26th September
  return obj;
}, {
  agility: 0,
});

/**
 * Barbed Shot has a chance equal to your critical strike chance to grant you 314 agility for 8 sec.
 *
 * Example report:  https://www.warcraftlogs.com/reports/9mWQv1XZJT8M6GBV#fight=1&type=damage-done
 */
class DanceOfDeath extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  agility = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.DANCE_OF_DEATH.id);
    if (!this.active) {
      return;
    }
    const { agility } = danceOfDeathStats(this.selectedCombatant.traitsBySpellId[SPELLS.DANCE_OF_DEATH.id]);
    this.agility = agility;

    this.statTracker.add(SPELLS.DANCE_OF_DEATH_BUFF.id, {
      agility,
    });
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.DANCE_OF_DEATH_BUFF.id) / this.owner.fightDuration;
  }

  get avgAgility() {
    return this.uptime * this.agility;
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="flexible"
        category={"AZERITE_POWERS"}
        tooltip={(
          <>
            Dance of Death granted <strong>{this.agility}</strong> Agility for <strong>{formatPercentage(this.uptime)}%</strong> of the fight.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.DANCE_OF_DEATH}>
          <>
            <Agility /> {formatNumber(this.avgAgility)} <small>average Agility</small> <br />
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default DanceOfDeath;
