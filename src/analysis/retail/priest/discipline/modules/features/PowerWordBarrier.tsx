import fetchWcl from 'common/fetchWclApi';
import { formatNumber, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import LazyLoadStatisticBox from 'parser/ui/LazyLoadStatisticBox';

const POWER_WORD_BARRIER_REDUCTION = 0.2;

class PowerWordBarrier extends Analyzer {
  totalDamageTakenDuringPWB = 0;

  get damageReducedDuringPowerWordBarrier() {
    return (
      (this.totalDamageTakenDuringPWB / (1 - POWER_WORD_BARRIER_REDUCTION)) *
      POWER_WORD_BARRIER_REDUCTION
    );
  }

  get damageReduced() {
    return this.damageReducedDuringPowerWordBarrier;
  }

  load() {
    return fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `IN RANGE FROM type='${EventType.ApplyBuff}' AND ability.id=${SPELLS.POWER_WORD_BARRIER_BUFF.id} TO type='${EventType.RemoveBuff}' AND ability.id=${SPELLS.POWER_WORD_BARRIER_BUFF.id} GROUP BY target ON target END`,
    }).then((json: any) => {
      this.totalDamageTakenDuringPWB = json.entries.reduce(
        (damageTaken: number, entry: any) => damageTaken + entry.total,
        0,
      );
    });
  }

  statistic() {
    const fightDuration = this.owner.fightDuration;

    return (
      <LazyLoadStatisticBox
        loader={this.load.bind(this)}
        icon={<SpellIcon spell={SPELLS.POWER_WORD_BARRIER_BUFF} />}
        value={`≈${formatNumber(
          (this.damageReducedDuringPowerWordBarrier / fightDuration) * 1000,
        )} DRPS`}
        label="Barrier DRPS"
        tooltip={`The total Damage Reduced by Power Word: Barrier was ${formatThousands(
          this.damageReducedDuringPowerWordBarrier,
        )} (${formatNumber(
          (this.damageReducedDuringPowerWordBarrier / fightDuration) * 1000,
        )} per second average). This includes values from other priests in your raid due to technical limitations.`}
      />
    );
  }
}

export default PowerWordBarrier;
