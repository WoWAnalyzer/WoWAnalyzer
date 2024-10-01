import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { ARCANE_TEMPO_HASTE_PER_STACK, ARCANE_TEMPO_MAX_STACKS } from 'analysis/retail/mage/shared';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  EventType,
  FightEndEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatDuration, formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import HasteIcon from 'interface/icons/Haste';

/**
 * **Arcane Tempo**
 * Spec Talent
 *
 * Consuming Arcane Charges increases your Haste by 2% for 12 sec, stacks up to 5 times.
 */
class ArcaneTempo extends Analyzer {
  /** Array keeps track of how much time was spent at each Arcane Tempo stack count.
   *  Index is stack count, value is accumulated time at that stack count */
  timeAtStackCount: number[];
  lastStackChangeTime: number = this.owner.fight.start_time;
  lastStackCount: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ARCANE_TEMPO_TALENT);

    this.timeAtStackCount = new Array(ARCANE_TEMPO_MAX_STACKS + 1).fill(0);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_TEMPO_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_TEMPO_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_TEMPO_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_TEMPO_BUFF),
      this.handleStacks,
    );
    this.addEventListener(Events.fightend, this.handleStacks);
  }

  handleStacks(
    event:
      | ApplyBuffEvent
      | ApplyBuffStackEvent
      | RemoveBuffEvent
      | RemoveBuffStackEvent
      | FightEndEvent,
  ) {
    this.timeAtStackCount[this.lastStackCount] += event.timestamp - this.lastStackChangeTime;
    if (event.type === EventType.FightEnd) {
      return;
    }
    this.lastStackChangeTime = event.timestamp;
    this.lastStackCount = currentStacks(event);
  }

  get averageStacks() {
    const durationTimesStacks = this.timeAtStackCount.reduce((prev, n, i) => prev + n * i, 0);
    return durationTimesStacks / this.owner.fightDuration;
  }

  get averageHaste() {
    return this.averageStacks * ARCANE_TEMPO_HASTE_PER_STACK;
  }

  get buffUptimeMS() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ARCANE_TEMPO_BUFF.id);
  }

  get buffUptimePercent() {
    return this.buffUptimeMS / this.owner.fightDuration;
  }

  get arcaneTempoUptimeThresholds() {
    return {
      actual: this.buffUptimePercent,
      isLessThan: {
        minor: 0.98,
        average: 0.95,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Haste-Bonus</th>
                  <th>Time (s)</th>
                  <th>Time (%)</th>
                </tr>
              </thead>
              <tbody>
                {this.timeAtStackCount.map((e, i) => (
                  <tr key={i}>
                    <th>{formatPercentage(i * ARCANE_TEMPO_HASTE_PER_STACK, 0)}%</th>
                    <td>{formatDuration(e)}</td>
                    <td>{formatPercentage(e / this.owner.fightDuration)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.ARCANE_TEMPO_TALENT}>
          <>
            <HasteIcon /> {formatPercentage(this.averageHaste)} %{' '}
            <small>average haste gained</small>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ArcaneTempo;
