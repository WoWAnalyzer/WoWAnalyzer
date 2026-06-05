import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const BAR_COLOR = '#00C853';

class Haunt extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get shadowOfNathrezaBonus() {
    let bonus = 0;

    bonus +=
      0.02 * this.selectedCombatant.getTalentRank(TALENTS.SHADOW_OF_NATHREZA_2_AFFLICTION_TALENT);
    return bonus;
  }

  get hauntDamageBonus() {
    return 0.12 + this.shadowOfNathrezaBonus;
  }

  get uptime() {
    return this.enemies.getBuffUptime(TALENTS.HAUNT_TALENT.id) / this.owner.fightDuration;
  }

  get dps() {
    return (this.bonusDmg / this.owner.fightDuration) * 1000;
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(TALENTS.HAUNT_TALENT.id);
  }

  get DowntimePerformance() {
    const downtime = 1 - this.uptime;

    if (downtime <= 0.01) return QualitativePerformance.Perfect;
    if (downtime <= 0.05) return QualitativePerformance.Good;
    if (downtime <= 0.1) return QualitativePerformance.Ok;

    return QualitativePerformance.Fail;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  bonusDmg = 0;
  totalTicks = 0;
  buffedTicks = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HAUNT_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    const target = this.enemies.getEntity(event);
    if (!target) {
      return;
    }

    const hasHaunt = target.hasBuff(TALENTS.HAUNT_TALENT.id, event.timestamp);

    if (hasHaunt) {
      this.bonusDmg += calculateEffectiveDamage(event, this.hauntDamageBonus);
    }
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [TALENTS.HAUNT_TALENT],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
      perf: this.DowntimePerformance,
    });
  }
}

export default Haunt;
