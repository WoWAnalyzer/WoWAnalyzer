import ITEMS from 'common/ITEMS/dragonflight/others';
import SPELLS from 'common/SPELLS/dragonflight/others';
import { formatDuration, formatPercentage } from 'common/format';
import classColor from 'game/classColor';
import ItemLink from 'interface/ItemLink';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import StatTracker from 'parser/shared/modules/StatTracker';
import { SECONDARY_STAT, getIcon, getName } from 'parser/shared/modules/features/STAT';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import { Fragment } from 'react';
import { voiceOfTheSilentStarStealAmount } from './VoiceOfTheSilentStar';

const deps = {
  combatants: Combatants,
  statTracker: StatTracker,
};

class UsurpedFromBeyond extends Analyzer.withDependencies(deps) {
  private thefts: {
    stat: SECONDARY_STAT;
    amount: number;
    thief: number | undefined;
    start?: number;
    end?: number;
  }[] = [];

  constructor(options: Options) {
    super(options);

    this.active = Object.values(this.deps.combatants.getEntities()).some(
      (combatant) =>
        // Any player that is not the selected player
        combatant.id !== this.selectedCombatant.id &&
        // That has Voice of the Silent Star equipped
        combatant.back.id === ITEMS.VOICE_OF_THE_SILENT_STAR.id,
    );
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.spell(SPELLS.USURPED_FROM_BEYOND).to(SELECTED_PLAYER),
      this.onApply,
    );

    this.addEventListener(
      Events.removebuff.spell(SPELLS.USURPED_FROM_BEYOND).to(SELECTED_PLAYER),
      this.onRemove,
    );
  }

  private onApply(event: ApplyBuffEvent) {
    const newBuff = {
      stat: this.currentLowestSecondaryStat(),
      amount: this.getAmount(event),
      thief: event.sourceID,
      start: event.timestamp,
    };

    // Unshift just so that `find()` find the most recent one
    this.thefts.unshift(newBuff);

    this.updateStats(newBuff.stat, newBuff.amount, event);
  }

  private onRemove(event: RemoveBuffEvent) {
    let thievery = this.thefts.find((d) => d.thief === event.sourceID);
    if (!thievery) {
      // If there was no debuff found, we fake one
      thievery = {
        stat: this.currentLowestSecondaryStat(),
        thief: event.sourceID,
        amount: this.getAmount(event),
        start: this.owner.fight.start_time,
      };
      this.thefts.unshift(thievery);
    }
    thievery.end = event.timestamp;

    this.updateStats(thievery.stat, -thievery.amount, event);
  }

  private getAmount(event: ApplyBuffEvent | RemoveBuffEvent) {
    const source = this.deps.combatants.getSourceEntity(event);

    const itemLevel =
      source?.getItem(ITEMS.VOICE_OF_THE_SILENT_STAR.id)?.itemLevel ??
      // Default heroic itemlevel as fallback to not implode
      431;

    const buffAmount = voiceOfTheSilentStarStealAmount(itemLevel);

    return -buffAmount;
  }

  private currentLowestSecondaryStat(): SECONDARY_STAT {
    return [
      {
        stat: SECONDARY_STAT.CRITICAL_STRIKE,
        value: this.deps.statTracker.currentCritRating,
      },
      {
        stat: SECONDARY_STAT.HASTE,
        value: this.deps.statTracker.currentHasteRating,
      },
      {
        stat: SECONDARY_STAT.MASTERY,
        value: this.deps.statTracker.currentMasteryRating,
      },
      {
        stat: SECONDARY_STAT.VERSATILITY,
        value: this.deps.statTracker.currentVersatilityRating,
      },
    ].reduce((acc, stat) => {
      if (stat.value < acc.value) {
        return stat;
      }
      return acc;
    }).stat;
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

  private thiefTable() {
    const thiefMap = this.thefts.reduce(
      (acc: Record<number, { duration: number; count: number }>, { thief, end, start }) => {
        if (thief) {
          if (!acc[thief]) {
            acc[thief] = {
              duration: 0,
              count: 0,
            };
          }

          acc[thief].duration +=
            (end ?? this.owner.fight.end_time) - (start ?? this.owner.fight.start_time);
          acc[thief].count += 1;
        }
        return acc;
      },
      {},
    );

    const victimEntries = Object.entries(thiefMap)
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
            <th style={{ textAlign: 'left' }}>Thief</th>
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
    if (this.thefts.length === 0) {
      // This module is always active, but if never robbed, should not show any statistic
      return null;
    }

    const uptimeEntries = this.thefts
      .reduce((acc, instance) => {
        const instanceUptime =
          (instance.end ?? this.owner.fight.end_time) -
          (instance.start ?? this.owner.fight.start_time);
        const instanceUptimePercentage = instanceUptime / this.owner.fightDuration;
        const instanceAverageBenefit = instance.amount * instanceUptimePercentage;

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

    const procCount = this.thefts.length;

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.UNIMPORTANT(8)}
        tooltip={
          <>
            Other players <ItemLink id={ITEMS.VOICE_OF_THE_SILENT_STAR.id} /> triggered{' '}
            <SpellLink spell={SPELLS.USURPED_FROM_BEYOND} /> on you {procCount} times, stealing from
            your lowest secondary stat at the time, which was{' '}
            {uptimeEntries.map((stat, index, arr) => (
              <Fragment key={stat.stat}>
                {index !== 0 && ', '}
                {index !== 0 && index === arr.length - 1 && 'and '}
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
                Each time someone else procs <SpellLink spell={SPELLS.POWER_BEYOND_IMAGINATION} /> ,
                they steal from your lowest secondary stat at the time.
              </small>
            </div>
            {this.thiefTable()}
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.USURPED_FROM_BEYOND}>
          {uptimeEntries.map(({ stat, averageBenefit }) => {
            const StatIcon = getIcon(stat);
            return (
              <div key={stat}>
                <StatIcon /> {Math.round(averageBenefit)} <small>{getName(stat)} over time</small>
              </div>
            );
          })}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default UsurpedFromBeyond;
