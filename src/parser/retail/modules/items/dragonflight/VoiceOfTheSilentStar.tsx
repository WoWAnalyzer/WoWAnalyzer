import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { formatDuration, formatPercentage } from 'common/format';
import classColor from 'game/classColor';
import { ItemLink, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, Item, RemoveBuffEvent } from 'parser/core/Events';
import { calculateSecondaryStatDefault } from 'parser/core/stats';
import Combatants from 'parser/shared/modules/Combatants';
import StatTracker from 'parser/shared/modules/StatTracker';
import STAT, { SECONDARY_STAT, getIcon, getName } from 'parser/shared/modules/features/STAT';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import { Fragment } from 'react';

// ================ SAMPLE LOGS ================
// Voice ilvl 424
// https://www.warcraftlogs.com/reports/TB1G3tDa6frn7dYF#fight=2&type=summary&source=15
// Voice ilvl 457
// https://www.warcraftlogs.com/reports/gQ8L9YjvzcDf1kxa#fight=23&type=summary&source=321
// Voice ilvl 447 (Two different stats)
// https://www.warcraftlogs.com/reports/p4bgq8k6QjBV7ztT#fight=15&type=summary&source=299

function getBaseAmount(itemLevel: number) {
  return calculateSecondaryStatDefault(431, 1764.942, itemLevel);
}

function getStealAmount(itemLevel: number) {
  return calculateSecondaryStatDefault(431, 117.942, itemLevel);
}

const deps = {
  combatants: Combatants,
  statTracker: StatTracker,
};

class VoiceOfTheSilentStar extends Analyzer.withDependencies(deps) {
  private item!: Item;
  private baseAmount = 0;
  private stealAmount = 0;
  private buffs: {
    stat: SECONDARY_STAT;
    victims: Set<number>;
    start?: number;
    end?: number;
  }[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasBack(ITEMS.VOICE_OF_THE_SILENT_STAR.id);
    if (!this.active) {
      return;
    }
    this.item = this.selectedCombatant.back;
    this.baseAmount = getBaseAmount(this.item.itemLevel);
    this.stealAmount = getStealAmount(this.item.itemLevel);

    this.addEventListener(
      Events.applybuff.spell(SPELLS.POWER_BEYOND_IMAGINATION).to(SELECTED_PLAYER),
      this.onApplyBuff,
    );

    this.addEventListener(
      Events.removebuff.spell(SPELLS.POWER_BEYOND_IMAGINATION).to(SELECTED_PLAYER),
      this.onRemoveBuff,
    );

    this.addEventListener(
      Events.applybuff.spell(SPELLS.USURPED_FROM_BEYOND).by(SELECTED_PLAYER),
      this.onApplySteal,
    );

    this.addEventListener(
      Events.removebuff.spell(SPELLS.USURPED_FROM_BEYOND).by(SELECTED_PLAYER),
      this.onRemoveSteal,
    );
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    const newBuff = this.createBuff(event.timestamp);

    this.buffs.push(newBuff);

    this.updateStats(newBuff.stat, this.baseAmount, event);
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    let lastBuff = this.buffs[this.buffs.length - 1];

    if (!lastBuff) {
      // Looks like we haven't started any buffs yet, let's fake a buff
      lastBuff = this.createBuff(this.owner.fight.start_time);
      this.buffs.push(lastBuff);
    }

    lastBuff.end = this.owner.currentTimestamp;

    this.updateStats(lastBuff.stat, -this.baseAmount, event);
  }

  private onApplySteal(event: ApplyBuffEvent) {
    let lastBuff = this.buffs[this.buffs.length - 1];

    if (!lastBuff) {
      // Looks like we haven't started any buffs yet, let's fake a buff
      lastBuff = this.createBuff(event.timestamp);
      this.buffs.push(lastBuff);
    }

    if (lastBuff.victims.size >= 4) {
      throw new Error(
        'Voice of the Silent Star: More than 4 people are being robbed, somethings wrong',
      );
    }

    lastBuff.victims.add(event.targetID);

    this.updateStats(lastBuff.stat, this.stealAmount, event);
  }

  private onRemoveSteal(event: RemoveBuffEvent) {
    const lastBuff = this.buffs[this.buffs.length - 1];

    if (!lastBuff) {
      throw new Error('Voice of the Silent Star: No buff to remove steal from');
    }

    if (!lastBuff.victims.has(event.targetID)) {
      throw new Error('Voice of the Silent Star: Steal faded from someone who was not tracked');
    }

    this.updateStats(lastBuff.stat, -this.stealAmount, event);
  }

  private updateStats(
    stat: SECONDARY_STAT,
    amount: number,
    event: ApplyBuffEvent | RemoveBuffEvent,
  ) {
    this.deps.statTracker.forceChangeStats(
      {
        [stat]: amount,
      },
      event,
    );
  }

  private createBuff(start?: number, end?: number) {
    return {
      stat: this.currentHighestSecondaryStat(),
      victims: new Set<number>(),
      start,
      end,
    };
  }

  private currentHighestSecondaryStat(): SECONDARY_STAT {
    return [
      {
        stat: STAT.CRITICAL_STRIKE,
        value: this.deps.statTracker.currentCritRating,
      },
      {
        stat: STAT.HASTE,
        value: this.deps.statTracker.currentHasteRating,
      },
      {
        stat: STAT.MASTERY,
        value: this.deps.statTracker.currentMasteryRating,
      },
      {
        stat: STAT.VERSATILITY,
        value: this.deps.statTracker.currentVersatilityRating,
      },
    ].reduce((acc, stat) => {
      if (stat.value > acc.value) {
        return stat;
      }
      return acc;
    }).stat;
  }

  private victimTable() {
    const victimMap = this.buffs.reduce(
      (acc: Record<number, { duration: number; count: number }>, buff) => {
        buff.victims.forEach((victim) => {
          if (!acc[victim]) {
            acc[victim] = {
              duration: 0,
              count: 0,
            };
          }

          acc[victim].duration +=
            (buff.end ?? this.owner.fight.end_time) - (buff.start ?? this.owner.fight.start_time);
          acc[victim].count += 1;
        });
        return acc;
      },
      {},
    );

    const victimEntries = Object.entries(victimMap)
      .sort(([, a], [, b]) => b.duration - a.duration)
      .map(([victimID, { duration, count }]) => ({
        victimID: Number(victimID),
        duration,
        count,
      }));

    const combatants = this.deps.combatants.getEntities();

    return (
      <table className="table table-condensed">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Player</th>
            <th>Duration</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {victimEntries.map(({ victimID, duration, count }) => {
            const combatant = combatants[victimID];
            const className = classColor(combatant);

            return (
              <tr key={victimID}>
                <td style={{ textAlign: 'left' }}>
                  <span className={className}>{combatant.name}</span>
                </td>
                <td>{formatDuration(duration)}</td>
                <td>{count}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  statistic() {
    const uptimeEntries = this.buffs
      .reduce((acc, instance) => {
        const instanceUptime =
          (instance.end ?? this.owner.fight.end_time) -
          (instance.start ?? this.owner.fight.start_time);
        const instanceUptimePercentage = instanceUptime / this.owner.fightDuration;
        const instanceAmount = this.baseAmount + instance.victims.size * this.stealAmount;
        const instanceAverageBenefit = instanceAmount * instanceUptimePercentage;

        const existingEntry = acc.find((entry) => entry.stat === instance.stat);

        if (existingEntry) {
          existingEntry.totalUptime += instanceUptime;
          existingEntry.averageBenefit += instanceAverageBenefit;
        } else {
          acc.push({
            stat: instance.stat,
            totalUptime: instanceUptime,
            averageBenefit: instanceAverageBenefit,
          });
        }

        return acc;
      }, [] as { stat: SECONDARY_STAT; totalUptime: number; averageBenefit: number }[])
      .sort((a, b) => b.averageBenefit - a.averageBenefit);

    const procCount = this.buffs.length;

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.CORE(8)}
        tooltip={
          <>
            <ItemLink id={this.item.id} quality={this.item.quality} details={this.item} /> triggered{' '}
            <SpellLink spell={SPELLS.POWER_BEYOND_IMAGINATION} /> {procCount} times, giving{' '}
            {Math.round(this.baseAmount + 4 * this.stealAmount)} of your highest secondary stat at
            the time, which was{' '}
            {uptimeEntries.map((stat, index, arr) => (
              <Fragment key={stat.stat}>
                {index !== 0 && ', '}
                {index === arr.length - 1 && 'and '}
                {getName(stat.stat)} for {formatDuration(stat.totalUptime)} (
                {formatPercentage(stat.totalUptime / this.owner.fightDuration)}%)
              </Fragment>
            ))}
            .
          </>
        }
        dropdown={
          <>
            <div className="pad">
              <small>
                Each time <SpellLink spell={SPELLS.POWER_BEYOND_IMAGINATION} /> procced, you stole{' '}
                {Math.round(this.stealAmount)} secondary stats from up to 4 other players.
              </small>
            </div>
            {this.victimTable()}
          </>
        }
      >
        <BoringItemValueText item={this.item}>
          {uptimeEntries.map(({ stat, averageBenefit }) => {
            const StatIcon = getIcon(stat);
            return (
              <div key={stat}>
                <StatIcon /> {Math.round(averageBenefit)} <small>{getName(stat)} over time</small>
              </div>
            );
          })}
        </BoringItemValueText>
      </Statistic>
    );
  }
}

export default VoiceOfTheSilentStar;
