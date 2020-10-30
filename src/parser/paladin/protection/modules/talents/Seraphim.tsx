import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { formatPercentage } from 'common/format';
import UptimeIcon from 'interface/icons/Uptime';
import CriticalStrikeIcon from 'interface/icons/CriticalStrike';
import VersatilityIcon from 'interface/icons/Versatility';
import HasteIcon from 'interface/icons/Haste';
import MasteryIcon from 'interface/icons/Mastery';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Haste from 'parser/paladin/protection/modules/core/Haste';

const STAT_MODIFIER = 0.08;
const debug = false;

type BonusStats = {haste: number, crit: number, versatility: number, mastery: number};

/**
 * Consumes 3 Holy Power to grant 8% Haste, Crit, Versatility, and Mastery for 15 seconds.
 */
class Seraphim extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  }

  protected statTracker!: StatTracker;

  bonusStatGains: BonusStats[] = [];


  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SERAPHIM_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.SERAPHIM_TALENT), this.onSeraphimGain);
  }

  get uptime(): number {
    return this.selectedCombatant.getBuffUptime(SPELLS.SERAPHIM_TALENT.id) / this.owner.fightDuration;
  }

  get averageMasteryGain(): number {
    return STAT_MODIFIER * this.uptime;
  }

  get averageCritGain(): number {
    return STAT_MODIFIER * this.uptime;
  }

  get averageVersatilityGain(): number {
    return STAT_MODIFIER * this.uptime;
  }

  get averageHasteGain(): number {
    return this.bonusStatGains.map((gain: BonusStats) => gain.haste).reduce((sum, next) => sum + next, 0) / this.bonusStatGains.length * this.uptime;
  }

  onSeraphimGain(event: ApplyBuffEvent): void {
    this.bonusStatGains.push(this.getBonusStats(this.statTracker));
  }

  getBonusStats(statTracker: StatTracker): BonusStats {
    const hasteChange = Haste.addHaste(statTracker.currentHastePercentage, STAT_MODIFIER) - statTracker.currentHastePercentage;
    debug && console.log(`Calculation haste change of ${hasteChange}`);
    return {
      haste: hasteChange,
      crit: STAT_MODIFIER,
      versatility: STAT_MODIFIER,
      mastery: STAT_MODIFIER,
    };
  }

  calculateBonusStatFromCurrent(currentStat: number): number {
    return currentStat - (currentStat * (1 / (1 + STAT_MODIFIER)));
  }

  statistic(): React.ReactNode {
    debug && console.log(`Stat gains: haste - ${this.averageHasteGain} crit - ${this.averageCritGain} - vers ${this.averageCritGain} - mastery ${this.averageMasteryGain}.`);
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.SERAPHIM_TALENT}>
          <UptimeIcon /> {formatPercentage(this.uptime, 0)}% <small>uptime</small><br />
          <HasteIcon /> {formatPercentage(this.averageHasteGain)}% <small>average Haste gained</small><br />
          <CriticalStrikeIcon /> {formatPercentage(this.averageCritGain)}% <small>average Crit gained</small><br />
          <VersatilityIcon /> {formatPercentage(this.averageVersatilityGain)}% <small>average Versatility gained</small><br />
          <MasteryIcon /> {formatPercentage(this.averageMasteryGain)}% <small>average Mastery gained</small><br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Seraphim;
