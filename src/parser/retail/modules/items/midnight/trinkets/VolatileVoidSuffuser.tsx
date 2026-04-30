import ITEMS from 'common/ITEMS/midnight/trinkets';
import SPELLS from 'common/SPELLS/midnight/trinkets';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  HealEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  Ability,
} from 'parser/core/Events';
import { HasHitpoints } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import { HealthIcon, IntellectIcon } from 'interface/icons';
import SpellLink from 'interface/SpellLink';
import { calculatePrimaryStat } from 'parser/core/stats';
import StatTracker from 'parser/shared/modules/StatTracker';

// base taken from wowhead
// https://www.wowhead.com/item=249341/volatile-void-suffuser
const BASE_ILVL = 45;
const BASE_INTELLECT = 15;

interface ProcData {
  timestamp: number;
  targetHealthPercent: number;
  missingHealthPercent: number;
  intellectGained: number;
  ability: Ability;
}

export default class VolatileVoidSuffuser extends Analyzer.withDependencies({
  statTracker: StatTracker,
}) {
  protected procs: ProcData[] = [];

  intellectProc = BASE_INTELLECT;

  constructor(options: Options) {
    super(options);

    const suffuser = this.selectedCombatant.getTrinket(ITEMS.VOLATILE_VOID_SUFFUSER.id);
    if (!suffuser) {
      this.active = false;
      return;
    }

    this.intellectProc = calculatePrimaryStat(BASE_ILVL, BASE_INTELLECT, suffuser.itemLevel);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.VOID_SUFFUSION),
      this.onBuffGain,
    );
    this.addEventListener(
      Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.VOID_SUFFUSION),
      this.onBuffGain,
    );
  }

  private onHeal(event: HealEvent) {
    if (!HasHitpoints(event)) return;

    this.lastHealEvent = event;
  }

  private lastHealEvent: HealEvent | null = null;

  private onBuffGain(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    this.recordProc(event.timestamp);
  }

  private recordProc(timestamp: number) {
    if (!this.lastHealEvent || !HasHitpoints(this.lastHealEvent)) return;

    const healEvent = this.lastHealEvent;

    const healthBeforeHeal = healEvent.hitPoints - healEvent.amount;
    const targetHealthPercent = healthBeforeHeal / healEvent.maxHitPoints;
    const missingHealthPercent = 1 - targetHealthPercent;

    // int proc + ((1% of int proc) per 1% missing hp)
    const intellectGained =
      this.intellectProc + (this.intellectProc / 100) * (missingHealthPercent * 100);

    this.deps.statTracker.add(SPELLS.VOID_SUFFUSION.id, { intellect: intellectGained });

    this.procs.push({
      timestamp,
      targetHealthPercent,
      missingHealthPercent,
      intellectGained,
      ability: healEvent.ability,
    });
  }

  get totalProcs() {
    return this.procs.length;
  }

  private average<K extends keyof ProcData>(key: K): number {
    if (this.procs.length === 0) return 0;

    return this.procs.reduce((acc, proc) => acc + (proc[key] as number), 0) / this.procs.length;
  }

  statistic() {
    const uptime = this.selectedCombatant.getBuffUptime(SPELLS.VOID_SUFFUSION.id);
    const uptimePercent = uptime / this.owner.fightDuration;
    const stackUptimes = this.selectedCombatant.getStackBuffUptimes(SPELLS.VOID_SUFFUSION.id);

    const procRows = this.procs.map((proc, index) => {
      const castTime = proc.timestamp - this.owner.fight.start_time;
      return (
        <tr key={index}>
          <td>{formatDuration(castTime)}</td>
          <td>
            <SpellLink spell={proc.ability.guid} />
          </td>
          <td>{formatPercentage(proc.targetHealthPercent, 1)}%</td>
        </tr>
      );
    });

    const stackRows = Object.entries(stackUptimes)
      .filter(([stacks]) => Number(stacks) > 0)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([stacks, uptime]) => {
        const stackUptimePercent = uptime / this.owner.fightDuration;
        return (
          <tr key={stacks}>
            <td>{stacks}</td>
            <td>{formatDuration(uptime)}</td>
            <td>{formatPercentage(stackUptimePercent, 1)}%</td>
          </tr>
        );
      });

    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            <div>
              <b>
                <SpellLink spell={ITEMS.VOLATILE_VOID_SUFFUSER} />
              </b>{' '}
              triggered <b>{this.totalProcs}</b> times,{' '}
              {this.owner.getPerMinute(this.totalProcs).toFixed(2)} procs per minute with{' '}
              {formatPercentage(uptimePercent, 1)}% total uptime.
            </div>
            <div>
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <th>Stacks</th>
                    <th>Uptime</th>
                    <th>% of Fight</th>
                  </tr>
                </thead>
                <tbody>{stackRows}</tbody>
              </table>
            </div>
          </>
        }
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Time</th>
                <th>Ability</th>
                <th>Target HP %</th>
              </tr>
            </thead>
            <tbody>{procRows}</tbody>
          </table>
        }
      >
        <BoringItemValueText item={ITEMS.VOLATILE_VOID_SUFFUSER}>
          <div>
            <HealthIcon /> {formatPercentage(this.average('targetHealthPercent'), 1)}%{' '}
            <small>average target health</small>
          </div>
          <div>
            <IntellectIcon /> {formatNumber(this.average('intellectGained'))}{' '}
            <small>average Intellect per proc</small>
          </div>
        </BoringItemValueText>
      </Statistic>
    );
  }
}
