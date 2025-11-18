import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import UptimeIcon from 'interface/icons/Uptime';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import Events from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import EarlyDotRefreshesAnalyzer from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshes';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { TALENTS_SHAMAN } from 'common/TALENTS';

export const FLAMESHOCK_BASE_DURATION = 18000;

class FlameShock extends EarlyDotRefreshesAnalyzer {
  static dots = [
    {
      name: 'Flame Shock',
      debuffId: SPELLS.FLAME_SHOCK.id,
      castId: SPELLS.FLAME_SHOCK.id,
      duration: FLAMESHOCK_BASE_DURATION,
      movementFiller: true,
    },
  ];

  badLavaBursts = 0;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.FLAME_SHOCK.id) / this.owner.fightDuration;
  }

  get refreshThreshold() {
    const casts = this.casts;
    return {
      spell: SPELLS.FLAME_SHOCK,
      count: casts[SPELLS.FLAME_SHOCK.id].badCasts,
      actual: this.badCastsPercent(SPELLS.FLAME_SHOCK.id),
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get uptimeThreshold() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.99,
        average: 0.95,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.LAVA_BURST_TALENT),
      this.onLavaBurst,
    );
  }

  onLavaBurst(event: DamageEvent) {
    const target = this.enemies.getEntity(event);
    if (target && !target.hasBuff(SPELLS.FLAME_SHOCK.id)) {
      this.badLavaBursts += 1;
    }
  }

  getDebuffStackHistory() {
    return this.enemies.getDebuffStackHistory(SPELLS.FLAME_SHOCK.id);
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE()} size="flexible" tooltip="Flame Shock Uptime">
        <BoringSpellValueText spell={SPELLS.FLAME_SHOCK}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FlameShock;
