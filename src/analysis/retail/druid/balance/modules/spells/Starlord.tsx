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
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import UptimeStackBar, { getStackUptimesFromBuffHistory } from 'parser/ui/UptimeStackBar';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { getUptimesFromBuffHistory } from 'parser/ui/UptimeBar';

const MAX_STACKS = 3;
const HASTE_PER_STACK = 4;

const STARLORD_COLOR = '#224488';
const STARLORD_BG_COLOR = '#88aabb';

class Starlord extends Analyzer {
  get averageStacks() {
    let avgStacks = 0;
    this.buffStacks.forEach((elem: number[], index: number) => {
      avgStacks += (elem.reduce((a, b) => a + b) / this.owner.fightDuration) * index;
    });
    return avgStacks;
  }

  get averageHaste() {
    return this.averageStacks * HASTE_PER_STACK;
  }

  buffStacks: number[][];
  lastStacks = 0;
  lastUpdate = this.owner.fight.start_time;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.STARLORD_TALENT);
    this.buffStacks = Array.from({ length: MAX_STACKS + 1 }, (x) => [0]);

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
    stack = null,
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
        grants a high amount of haste if uptime is maintained. Adding stacks does <i>not</i> refresh
        duration, so it's impossible to maintain 100% uptime. Pool Astral Power when Starlord is
        about to fall so you can get back to 3 stacks as quickly as possible.
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>Starlord uptime</strong>
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
            <SpellIcon spell={TALENTS_DRUID.STARLORD_TALENT} />{' '}
            <span style={{ color: STARLORD_BG_COLOR }}>
              {formatPercentage(overallUptimePercent, 0)}% <small>active</small>
            </span>
            <br />
            <TooltipElement
              content={`This is the average number of stacks you had over the course of the fight, counting periods where you didn't have the buff as zero stacks.`}
            >
              <span style={{ color: STARLORD_COLOR }}>
                {this.averageStacks.toFixed(1)} <small>avg stacks</small>
              </span>
            </TooltipElement>
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
                  <th>Haste-Bonus</th>
                  <th>Time (s)</th>
                  <th>Time (%)</th>
                </tr>
              </thead>
              <tbody>
                {this.buffStacks.map((e, i) => (
                  <tr key={i}>
                    <th>{(i * HASTE_PER_STACK).toFixed(0)}%</th>
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
        <BoringSpellValueText spell={TALENTS_DRUID.STARLORD_TALENT}>
          <>
            <HasteIcon /> {this.averageHaste.toFixed(2)} % <small>average haste gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Starlord;
