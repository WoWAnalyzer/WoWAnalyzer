import TALENTS from 'common/TALENTS/priest';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
//import Statistic from 'parser/ui/Statistic';
//import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
//import { formatPercentage } from 'common/format';

const BAR_COLOR = '#9933cc';

class DevouringPlague extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  castsDP = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DEVOURING_PLAGUE_TALENT),
      this.onDPCast,
    );
  }

  onDPCast() {
    this.castsDP += 1;
  }

  get uptime() {
    return (
      this.enemies.getBuffUptime(TALENTS.DEVOURING_PLAGUE_TALENT.id) / this.owner.fightDuration
    );
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(TALENTS.DEVOURING_PLAGUE_TALENT.id);
  }

  get DowntimePerformance(): QualitativePerformance {
    const downtime = 1 - this.uptime;
    if (downtime <= 0.1) {
      return QualitativePerformance.Perfect;
    }
    if (downtime <= 0.2) {
      return QualitativePerformance.Good;
    }
    if (downtime <= 0.3) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [TALENTS.DEVOURING_PLAGUE_TALENT],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
      perf: this.DowntimePerformance,
    });
  }

  getMaxUptime() {
    let durationDP = 7000;
    if (this.selectedCombatant.hasTalent(TALENTS.DISTORTED_REALITY_TALENT)) {
      durationDP = 12000;
    }
    //TODO: Add Shadow 2 piece bonus

    return (this.castsDP * durationDP) / this.owner.fightDuration;
  }

  /*  
  This information is interesting, but I don't really know if its helpful or harmful to see.  
  Until I find a better way to present it, I'm leaving it out for now.

  statistic() {
    return (
      <Statistic size="flexible">
        <BoringSpellValueText spell={TALENTS.DEVOURING_PLAGUE_TALENT}>
          <>
            <div>{formatPercentage(this.uptime, 0)}% uptime.{' '}</div>
            <small>For {this.castsDP} casts of Devouring plague, {formatPercentage(this.getMaxUptime(),0)}% is the max possible uptime.</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
  */
}

export default DevouringPlague;
