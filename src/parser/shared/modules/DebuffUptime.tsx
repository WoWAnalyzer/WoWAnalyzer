import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import Spell from 'common/SPELLS/Spell';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

abstract class DebuffUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  abstract readonly debuffSpell: Spell;

  get debuffUptime(): number {
    return this.enemies.getBuffUptime(this.debuffSpell.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.debuffUptime,
      isLessThan: {
        minor: 0.85,
        average: 0.8,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get DowntimePerformance(): QualitativePerformance {
    const suggestionThresholds = this.suggestionThresholds.isLessThan;
    if (this.debuffUptime >= 1) {
      return QualitativePerformance.Perfect;
    }
    if (this.debuffUptime >= suggestionThresholds.minor) {
      return QualitativePerformance.Good;
    }
    if (this.debuffUptime >= suggestionThresholds.average) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }
}

export default DebuffUptime;
