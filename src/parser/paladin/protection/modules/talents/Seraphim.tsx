import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { formatNumber, formatPercentage } from 'common/format';
import UptimeIcon from 'interface/icons/Uptime';
import CriticalStrikeIcon from 'interface/icons/CriticalStrike';
import VersatilityIcon from 'interface/icons/Versatility';
import HasteIcon from 'interface/icons/Haste';
import MasteryIcon from 'interface/icons/Mastery';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

const STAT_MODIFIER = 0.08;

type BonusStats = {haste: number, crit: number, versatility: number, mastery: number};

/**
 * Consumes 3 Holy Power to grant 8% Haste, Crit, Versatility, and Mastery for 15 seconds.
 */
class Seraphim extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;

  bonusStatGains: BonusStats[] = [];


  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SERAPHIM_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SERAPHIM_TALENT), this.onCast);
    const localStatTracker = (options.statTracker as StatTracker);
    const bonusStats = this.getBonusStats(localStatTracker);
    localStatTracker.add(SPELLS.SERAPHIM_TALENT.id, bonusStats);

  }

  get uptime(): number {
    return this.selectedCombatant.getBuffUptime(SPELLS.SERAPHIM_TALENT.id) / this.owner.fightDuration;
  }

  get averageMasteryGain(): number {
    return this.bonusStatGains.map((gain) => gain.mastery).reduce((sum, next) => sum + next, 0) / this.bonusStatGains.length;
  }

  get averageCritGain(): number {
    return this.bonusStatGains.map((gain) => gain.crit).reduce((sum, next) => sum + next, 0) / this.bonusStatGains.length;
  }

  get averageVersatilityGain(): number {
    return this.bonusStatGains.map((gain) => gain.versatility).reduce((sum, next) => sum + next, 0) / this.bonusStatGains.length;
  }

  get averageHasteGain(): number {
    return this.bonusStatGains.map((gain) => gain.haste).reduce((sum, next) => sum + next, 0) / this.bonusStatGains.length;
  }

  onCast(event: CastEvent): void {
    this.bonusStatGains.push(this.getBonusStats(this.statTracker));
  }

  getBonusStats(statTracker: StatTracker): BonusStats {
    return {
      haste: statTracker.currentHasteRating * STAT_MODIFIER,
      crit: statTracker.currentCritRating * STAT_MODIFIER,
      versatility: statTracker.currentVersatilityRating * STAT_MODIFIER,
      mastery: statTracker.currentMasteryRating * STAT_MODIFIER,
    };
  }

  statistic(): React.ReactNode {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.SERAPHIM_TALENT}>
          <UptimeIcon /> {formatPercentage(this.uptime, 0)}% <small>uptime</small><br />
          <HasteIcon /> {formatNumber(this.averageHasteGain)} <small>average Haste gained</small><br />
          <CriticalStrikeIcon /> {formatNumber(this.averageCritGain)} <small>average Critical Strike gained</small><br />
          <VersatilityIcon /> {formatNumber(this.averageVersatilityGain)} <small>average Versatility gained</small><br />
          <MasteryIcon /> {formatNumber(this.averageMasteryGain)} <small>average Mastery gained</small><br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Seraphim;
