import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import HasteIcon from 'interface/icons/Haste';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  EventType,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  FightEndEvent,
} from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { SpellIcon, SpellLink } from 'interface';
import UptimeStackBar, { getStackUptimesFromBuffHistory } from 'parser/ui/UptimeStackBar';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { getUptimesFromBuffHistory } from 'parser/ui/UptimeBar';
import TalentSpellText from 'parser/ui/TalentSpellText';

const MAX_STACKS = 3;
const HASTE_PER_STACK_PER_RANK = 0.02;

const STARLORD_COLOR = '#224488';
const STARLORD_BG_COLOR = '#88aabb';

/**
 * **Starlord**
 * Spec Talent
 *
 * Starsurge and Starfall grant you (2 / 4)% Haste for 15 sec.
 * Stacks up to 3 times. Gaining a stack does not refresh the duration.
 */
class Starlord extends Analyzer {
  get averageStacks() {
    let avgStacks = 0;
    this.buffStacks.forEach((elem: number[], index: number) => {
      avgStacks += (elem.reduce((a, b) => a + b) / this.owner.fightDuration) * index;
    });
    return avgStacks;
  }

  get averageHaste() {
    return this.averageStacks * this.hastePerStack * 100;
  }

  get threeStackUptimePercent() {
    const threeStackTime = this.buffStacks[MAX_STACKS].reduce((a, b) => a + b, 0);
    return threeStackTime / this.owner.fightDuration;
  }

  ranks;
  hastePerStack;

  buffStacks: number[][];
  lastStacks = 0;
  lastUpdate = this.owner.fight.start_time;

  constructor(options: Options) {
    super(options);
    this.ranks = this.selectedCombatant.getTalentRank(TALENTS_DRUID.STARLORD_TALENT);
    this.active = this.ranks > 0;
    this.hastePerStack = HASTE_PER_STACK_PER_RANK * this.ranks;
    this.buffStacks = Array.from({ length: MAX_STACKS + 1 }, () => [0]);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.STARLORD),
      this.handleStacks,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.STARLORD),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.STARLORD),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.STARLORD),
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
    _stack = null,
  ) {
    this.buffStacks[this.lastStacks].push(event.timestamp - this.lastUpdate);
    if (event.type === EventType.FightEnd) {
      return;
    }
    this.lastUpdate = event.timestamp;
    this.lastStacks = currentStacks(event);
  }

  get guideSubsection() {
    const explanation = (
      <>
        <strong>
          <SpellLink spell={TALENTS_DRUID.STARLORD_TALENT} />
        </strong>{' '}
        grants a significant haste bonus that increases with each stack, try to maximize time spent
        at 3 stacks. Since gaining a stack does <i>not</i> refresh the duration, 100% uptime is
        impossible. Plan ahead by pooling Astral Power as Starlord is about to expire so you can
        quickly rebuild to 3 stacks.
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>Starlord Uptime</strong>
          {this.subStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  subStatistic() {
    const buffHistory = this.selectedCombatant.getBuffHistory(SPELLS.STARLORD.id);
    const overallUptimes = getUptimesFromBuffHistory(buffHistory, this.owner.currentTimestamp);
    const stackUptimes = getStackUptimesFromBuffHistory(buffHistory, this.owner.currentTimestamp);

    const overallUptimePercent =
      this.selectedCombatant.getBuffUptime(SPELLS.STARLORD.id) / this.owner.fightDuration;

    return (
      <div className="flex-main multi-uptime-bar">
        <div className="flex main-bar-big">
          <div className="flex-sub bar-label">
            <div style={{ color: STARLORD_BG_COLOR }}>
              <SpellIcon spell={TALENTS_DRUID.STARLORD_TALENT} />{' '}
              {formatPercentage(overallUptimePercent, 0)}% <small>active</small>
            </div>
            <div style={{ color: STARLORD_BG_COLOR }}>
              {formatPercentage(this.threeStackUptimePercent, 0)}% <small>Max Stacks Uptime</small>
            </div>
            {this.averageStacks.toFixed(1)} <small>avg stacks</small>
          </div>
          <div className="flex-main chart">
            <UptimeStackBar
              stackUptimeHistory={stackUptimes}
              start={this.owner.fight.start_time}
              end={this.owner.fight.end_time}
              maxStacks={MAX_STACKS}
              barColor={STARLORD_COLOR}
              backgroundHistory={overallUptimes}
              backgroundBarColor={STARLORD_BG_COLOR}
              timeTooltip
            />
          </div>
        </div>
      </div>
    );
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
                  <th scope="col">Haste-Bonus</th>
                  <th scope="col">Time (s)</th>
                  <th scope="col">Time (%)</th>
                </tr>
              </thead>
              <tbody>
                {this.buffStacks.map((e, i) => (
                  <tr key={i}>
                    <th>{formatPercentage(i * this.hastePerStack, 0)}%</th>
                    <td>{formatDuration(e.reduce((a, b) => a + b, 0))}</td>
                    <td>
                      {formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DRUID.STARLORD_TALENT}>
          <>
            <HasteIcon /> {this.averageHaste.toFixed(2)} % <small>average haste gained</small>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Starlord;
