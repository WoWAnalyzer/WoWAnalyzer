import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import CriticalStrike from 'interface/icons/CriticalStrike';
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
import TALENTS from 'common/TALENTS/hunter';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import UptimeStackBar, { getStackUptimesFromBuffHistory } from 'parser/ui/UptimeStackBar';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { getUptimesFromBuffHistory } from 'parser/ui/UptimeBar';
import TalentSpellText from 'parser/ui/TalentSpellText';

const MAX_STACKS = 3;
const CRIT_DAM_PER_STACK = 0.33;

const HOWL_COLOR = '#224488';
const HOWL_BG_COLOR = '#88aabb';

/**
 * **Howl of the Pack**
 * Pack Leader Talent
 *
 * Pet Basic Attack Critical Strikes grant you 11% Critical Damage per stack.
 */
class HowlOfThePack extends Analyzer {
  get averageStacks() {
    let avgStacks = 0;
    this.buffStacks.forEach((elem: number[], index: number) => {
      avgStacks += (elem.reduce((a, b) => a + b) / this.owner.fightDuration) * index;
    });
    return avgStacks;
  }

  get averageCritDamage() {
    return this.averageStacks * this.critDamagePerStack * 100;
  }

  ranks;
  critDamagePerStack;

  buffStacks: number[][];
  lastStacks = 0;
  lastUpdate = this.owner.fight.start_time;

  constructor(options: Options) {
    super(options);
    this.ranks = this.selectedCombatant.getTalentRank(TALENTS.HOWL_OF_THE_PACK_TALENT);
    this.active = this.ranks > 0;
    this.critDamagePerStack = CRIT_DAM_PER_STACK;
    this.buffStacks = Array.from({ length: MAX_STACKS + 1 }, (x) => [0]);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.HOWL_OF_THE_PACK_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.HOWL_OF_THE_PACK_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HOWL_OF_THE_PACK_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.HOWL_OF_THE_PACK_BUFF),
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
          <SpellLink spell={TALENTS.HOWL_OF_THE_PACK_TALENT} />
        </strong>{' '}
        grants a high amount of critical strike damage and is ideal to keep at <strong>3</strong>{' '}
        stacks. The average stacks through a fight is more important that uptime alone.
        <SpellLink spell={TALENTS.WILD_ATTACKS_TALENT} /> will significantly increase your uptime
        passively and through use of <SpellLink spell={TALENTS.PACK_COORDINATION_TALENT} />,{' '}
        <SpellLink spell={TALENTS.RAPTOR_STRIKE_TALENT} /> can force your pet to use their basic
        attack to ensure the third basic attack occurs during the 8s duration. It is recommended for
        Single-Target to monitor your buff duration in order to Raptor Strike when necessary to
        force a refresh.
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>Howl uptime</strong>
          {this.subStatistic()}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  subStatistic() {
    const buffHistory = this.selectedCombatant.getBuffHistory(SPELLS.HOWL_OF_THE_PACK_BUFF.id);
    const overallUptimes = getUptimesFromBuffHistory(buffHistory, this.owner.currentTimestamp);
    const stackUptimes = getStackUptimesFromBuffHistory(buffHistory, this.owner.currentTimestamp);

    const overallUptimePercent =
      this.selectedCombatant.getBuffUptime(SPELLS.HOWL_OF_THE_PACK_BUFF.id) /
      this.owner.fightDuration;

    return (
      <div className="flex-main multi-uptime-bar">
        <div className="flex main-bar-big">
          <div className="flex-sub bar-label">
            <SpellIcon spell={TALENTS.HOWL_OF_THE_PACK_TALENT} />{' '}
            <span style={{ color: HOWL_BG_COLOR }}>
              {formatPercentage(overallUptimePercent, 0)}% <small>active</small>
            </span>
            <br />
            <TooltipElement
              content={`This is the average number of stacks you had over the course of the fight, counting periods where you didn't have the buff as zero stacks.`}
            >
              <span style={{ color: HOWL_BG_COLOR }}>
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
              barColor={HOWL_COLOR}
              backgroundHistory={overallUptimes}
              backgroundBarColor={HOWL_BG_COLOR}
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
                  <th>Crit DamageBonus</th>
                  <th>Time (s)</th>
                  <th>Time (%)</th>
                </tr>
              </thead>
              <tbody>
                {this.buffStacks.map((e, i) => (
                  <tr key={i}>
                    <th>{formatPercentage(i * this.critDamagePerStack, 0)}%</th>
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
        <TalentSpellText talent={TALENTS.HOWL_OF_THE_PACK_TALENT}>
          <>
            <CriticalStrike /> {this.averageCritDamage.toFixed(2)} %{' '}
            <small>average Crit Damage gained</small>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default HowlOfThePack;
