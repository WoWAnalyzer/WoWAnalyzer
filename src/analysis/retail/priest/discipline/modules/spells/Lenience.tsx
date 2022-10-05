import fetchWcl from 'common/fetchWclApi';
import { formatNumber, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import LazyLoadStatisticBox from 'parser/ui/LazyLoadStatisticBox';
import { TALENTS_PRIEST } from 'common/TALENTS';
const LENIENCE_DR = 0.03;

class Lenience extends Analyzer {
  totalDamageTakenDuringAtonement = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.LENIENCE_TALENT.id);
  }

  get damageReducedDuringLenience() {
    return (this.totalDamageTakenDuringAtonement / (1 - LENIENCE_DR)) * LENIENCE_DR;
  }

  load() {
    return fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: `(IN RANGE FROM type='${EventType.ApplyBuff}' AND ability.id=${SPELLS.ATONEMENT_BUFF.id} AND source.name='${this.selectedCombatant.name}' TO type='${EventType.RemoveBuff}' AND ability.id=${SPELLS.ATONEMENT_BUFF.id} AND source.name='${this.selectedCombatant.name}' GROUP BY target ON target END)`,
    }).then((json: any) => {
      console.log('Received LR damage taken', json);
      this.totalDamageTakenDuringAtonement = json.entries.reduce(
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
        icon={<SpellIcon id={TALENTS_PRIEST.LENIENCE_TALENT.id} />}
        value={`>=${formatNumber((this.damageReducedDuringLenience / fightDuration) * 1000)} DRPS`}
        label="Damage reduced"
        tooltip={`The estimated damage reduced by Lenience's damage reduction was ${formatThousands(
          this.damageReducedDuringLenience,
        )} (${formatNumber(
          (this.damageReducedDuringLenience / fightDuration) * 1000,
        )} per second average). This is the lowest possible value. This value is 100% accurate for this log if you are looking at the actual gain over not having the Lenience bonus at all, but the gain may end up higher when taking interactions with other damage reductions into account.`}
      />
    );
  }
}

export default Lenience;
