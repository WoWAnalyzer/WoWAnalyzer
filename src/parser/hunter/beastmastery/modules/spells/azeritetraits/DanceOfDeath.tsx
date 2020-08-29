import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS/index';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Agility from 'interface/icons/Agility';
import UptimeIcon from 'interface/icons/Uptime';
import Statistic from 'interface/statistics/Statistic';
import Events from 'parser/core/Events';
import ThrillOfTheHunt from 'parser/hunter/beastmastery/modules/talents/ThrillOfTheHunt';
import SpellLink from 'common/SpellLink';
import { findMax, plotOneVariableBinomChart, poissonBinomialCDF, poissonBinomialPMF } from 'parser/shared/modules/helpers/Probability';

const danceOfDeathStats = (traits: number[]) => Object.values(traits).reduce((obj: { agility: number }, rank) => {
  const [agility] = calculateAzeriteEffects(SPELLS.DANCE_OF_DEATH.id, rank);
  obj.agility += agility;
  return obj;
}, {
  agility: 0,
});

/**
 * Barbed Shot has a chance equal to your critical strike chance to grant you 314 agility for 8 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/dhvBkQtHmJ23bYA4#fight=6&type=auras&source=10&ability=274443
 */
class DanceOfDeath extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    thrillOfTheHunt: ThrillOfTheHunt,
  };

  agility = 0;
  procChances: number = 0;
  procProbabilities: number[] = [];
  procAmounts: number = 0;

  protected statTracker!: StatTracker;
  protected thrillOfTheHunt!: ThrillOfTheHunt;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.DANCE_OF_DEATH.id);
    if (!this.active) {
      return;
    }
    const { agility } = danceOfDeathStats(this.selectedCombatant.traitsBySpellId[SPELLS.DANCE_OF_DEATH.id]);
    this.agility = agility;

    options.statTracker.add(SPELLS.DANCE_OF_DEATH_BUFF.id, {
      agility: this.agility,
    });

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BARBED_SHOT), this.onBarbedCast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DANCE_OF_DEATH_BUFF), this.onDanceOfDeathProc);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.DANCE_OF_DEATH_BUFF), this.onDanceOfDeathProc);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.DANCE_OF_DEATH_BUFF.id) / this.owner.fightDuration;
  }

  get avgAgility() {
    return this.uptime * this.agility;
  }

  onBarbedCast() {
    const procChance = this.statTracker.currentCritPercentage + this.thrillOfTheHunt.currentThrillCritPercentage;
    this.procChances += 1;
    this.procProbabilities.push(procChance);
  }

  onDanceOfDeathProc() {
    this.procAmounts += 1;
  }

  statistic() {
    const { max } = findMax(this.procProbabilities.length, (k, n) => poissonBinomialPMF(k, n, this.procProbabilities));

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
        tooltip={(
          <>
            Dance of Death granted <strong>{formatNumber(this.agility)}</strong> Agility for <strong>{formatPercentage(this.uptime)}%</strong> of the fight. <br />
            You had {formatPercentage(this.procAmounts / max)}% procs of what you could expect to get over the encounter. <br />
            You had a total of {this.procAmounts} procs, and your expected amount of procs was {formatNumber(max)}. <br />
            <ul>
              <li>You have a ≈{formatPercentage(poissonBinomialCDF(this.procAmounts, this.procChances, this.procProbabilities))}% chance of getting this amount of procs or fewer in the future with this amount of auto attacks.</li>
            </ul>
          </>
        )}
        dropdown={(
          <>
            <div style={{ padding: '8px' }}>
              {plotOneVariableBinomChart(this.procAmounts, this.procChances, this.procProbabilities)}
              <p>Likelihood of getting <em>exactly</em> as many procs as estimated on a fight given your number of <SpellLink id={SPELLS.BARBED_SHOT.id} /> casts.</p>
            </div>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.DANCE_OF_DEATH}>
          <>
            <Agility /> {formatNumber(this.avgAgility)} <small> average Agility</small> <br />
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DanceOfDeath;
