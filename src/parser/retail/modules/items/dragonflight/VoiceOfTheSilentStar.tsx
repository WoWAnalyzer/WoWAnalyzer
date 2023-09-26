import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { formatDuration, formatPercentage } from 'common/format';
import { ItemLink, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, Item, RemoveBuffEvent } from 'parser/core/Events';
import { calculateSecondaryStatDefault } from 'parser/core/stats';
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

class VoiceOfTheSilentStar extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  protected statTracker!: StatTracker;

  private item!: Item;
  private amount = 0;
  private buffs: {
    stat: SECONDARY_STAT;
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
    this.amount = calculateSecondaryStatDefault(431, 2235.71, this.item.itemLevel);

    this.addEventListener(
      Events.applybuff.spell(SPELLS.POWER_BEYOND_IMAGINATION).to(SELECTED_PLAYER),
      this.onApplyBuff,
    );

    this.addEventListener(
      Events.removebuff.spell(SPELLS.POWER_BEYOND_IMAGINATION).to(SELECTED_PLAYER),
      this.onRemoveBuff,
    );
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    const stat = this.currentHighestSecondaryStat();

    this.buffs.push({
      stat,
      start: this.owner.currentTimestamp,
    });

    this.updateStats(stat, this.amount, event);
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    let lastBuff = this.buffs[this.buffs.length - 1];

    if (!lastBuff) {
      // Looks like we haven't started any buffs yet, let's fake a buff
      lastBuff = {
        stat: this.currentHighestSecondaryStat(),
        start: this.owner.fight.start_time,
      };
      this.buffs.push(lastBuff);
    }

    lastBuff.end = this.owner.currentTimestamp;

    this.updateStats(lastBuff.stat, -this.amount, event);
  }

  private updateStats(
    stat: SECONDARY_STAT,
    amount: number,
    event: ApplyBuffEvent | RemoveBuffEvent,
  ) {
    this.statTracker.forceChangeStats(
      {
        [stat]: amount,
      },
      event,
    );
  }

  private currentHighestSecondaryStat(): SECONDARY_STAT {
    return [
      {
        stat: STAT.CRITICAL_STRIKE,
        value: this.statTracker.currentCritRating,
      },
      {
        stat: STAT.HASTE,
        value: this.statTracker.currentHasteRating,
      },
      {
        stat: STAT.MASTERY,
        value: this.statTracker.currentMasteryRating,
      },
      {
        stat: STAT.VERSATILITY,
        value: this.statTracker.currentVersatilityRating,
      },
    ].reduce((acc, stat) => {
      if (stat.value > acc.value) {
        return stat;
      }
      return acc;
    }).stat;
  }

  statistic() {
    const uptimePerStat = new Map([
      [STAT.CRITICAL_STRIKE, 0],
      [STAT.HASTE, 0],
      [STAT.MASTERY, 0],
      [STAT.VERSATILITY, 0],
    ]);

    this.buffs.forEach((buff) => {
      uptimePerStat.set(
        buff.stat,
        (uptimePerStat.get(buff.stat) ?? 0) +
          (buff.end ?? this.owner.fight.end_time) -
          (buff.start ?? this.owner.fight.start_time),
      );
    });

    const uptimeEntries = Array.from(uptimePerStat.entries())
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([stat, uptime]) => {
        const uptimePercentage = uptime / this.owner.fightDuration;
        const averageBenefit = Math.round(this.amount * uptimePercentage);

        return {
          stat,
          uptime,
          uptimePercentage,
          averageBenefit,
        };
      });

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
            {Math.round(this.amount)} of your highest secondary stat at the time, which was{' '}
            {uptimeEntries.map((stat, index) => (
              <Fragment key={stat.stat}>
                {index !== 0 && ', '}
                {index === uptimeEntries.length - 1 && 'and '}
                {getName(stat.stat)} for {formatDuration(stat.uptime)} (
                {formatPercentage(stat.uptimePercentage)}%)
              </Fragment>
            ))}
            .
          </>
        }
      >
        <BoringItemValueText item={this.item}>
          {uptimeEntries.map(({ stat, uptime, uptimePercentage, averageBenefit }, index) => {
            const StatIcon = getIcon(stat);
            return (
              <Fragment key={stat}>
                {index !== 0 && <hr />}
                <div>
                  <StatIcon /> {averageBenefit} <small>{getName(stat)} over time</small>
                </div>
              </Fragment>
            );
          })}
        </BoringItemValueText>
      </Statistic>
    );
  }
}

export default VoiceOfTheSilentStar;
