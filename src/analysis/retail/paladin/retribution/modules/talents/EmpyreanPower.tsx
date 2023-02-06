import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/paladin';

import { EMPYREAN_POWER_CHANCE } from '../../constants';

const BUFF_TIME: number = 15000 * 0.95; //add buffer since log events lmao
const TRACK_BUFFER = 500;

class EmpyreanPower extends Analyzer {
  averageTimeTillBuffConsumed: number = 0;

  hasProc: boolean = false;
  procsWasted: number = 0;
  procsGained: number = 0;

  damageDone: number = 0;

  buffAppliedTimestamp: number = 0;
  buffRemovedTimestamp: number = 0;

  totalChances: number = 0;
  procProbabilities: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EMPYREAN_POWER_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CRUSADER_STRIKE),
      this.castCounter,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_STORM_DAMAGE),
      this.divineStormDamage,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EMPYREAN_POWER_TALENT_BUFF),
      this.applyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.EMPYREAN_POWER_TALENT_BUFF),
      this.removeBuff,
    );
  }

  castCounter() {
    this.totalChances += 1;
    this.procProbabilities.push(EMPYREAN_POWER_CHANCE);
  }

  divineStormDamage(event: DamageEvent) {
    if (this.hasProc || this.buffRemovedTimestamp + TRACK_BUFFER > event.timestamp) {
      this.damageDone += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  applyBuff(event: ApplyBuffEvent) {
    this.hasProc = true;
    this.procsGained += 1;
    this.buffAppliedTimestamp = event.timestamp;
  }

  removeBuff(event: RemoveBuffEvent) {
    const lowerRoughTime = this.buffAppliedTimestamp + BUFF_TIME;
    if (lowerRoughTime < event.timestamp) {
      this.procsWasted += 1;
    }
    this.averageTimeTillBuffConsumed += event.timestamp - this.buffAppliedTimestamp;
    this.buffRemovedTimestamp = event.timestamp;
    this.hasProc = false;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <ul>
              <li>
                Average Time Till Buff Consumed:{' '}
                {formatDuration(this.averageTimeTillBuffConsumed / this.procsGained)}
              </li>
              <li>Total Buffs: {this.procsGained}</li>
              <li>Damage: {formatNumber(this.damageDone)}</li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.EMPYREAN_POWER_TALENT_BUFF.id}>
          <ItemDamageDone amount={this.damageDone} />
        </BoringSpellValueText>
        {plotOneVariableBinomChart(this.procsGained, this.totalChances, this.procProbabilities)}
      </Statistic>
    );
  }
}

export default EmpyreanPower;
