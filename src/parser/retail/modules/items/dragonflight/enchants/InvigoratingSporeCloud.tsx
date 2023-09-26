import SPELLS from 'common/SPELLS';
import { formatDuration } from 'common/format';
import { RetailSpec } from 'game/SPECS';
import { SpellLink } from 'interface';
import { UptimeIcon } from 'interface/icons';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import StatTracker from 'parser/shared/modules/StatTracker';
import STAT, { getIcon, getNameTranslated } from 'parser/shared/modules/features/STAT';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import { Fragment } from 'react';
import { getSporeTenderBuffValue } from './SporeTender';

function findLast<T>(arr: T[], predicate: (value: T) => boolean) {
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    if (predicate(arr[i])) {
      return arr[i];
    }
  }
  return null;
}

// ================ SAMPLE LOGS ================
// Invigorating Spore Cloud
// https://www.warcraftlogs.com/reports/CkDv213xNw8Lj4Xa#fight=11&type=auras&target=234&ability=406785&source=237

/**
 * This module has two main purposes:
 *
 * - Provide statistics on any potential benefit gained from the Invigorating Spore Cloud buff.
 * - Handle the stat changes that the buff provides.
 *   > This is not done effectively with `StatTracker.add()` as it needs to check the highest
 *   > secondary stat and rank of enchant from the healer that applied the buff.
 *   >
 *   > Using default StatBuffs are limited because the values of the buffs are checked on apply
 *   > _and_ on remove, meaning that we could hypotethically remove another stat than we added
 *   > originally.
 *   >
 *   > By having a separate module where we can track the buffs ourselves, we can 100% ensure
 *   > that the stat remains the same for the duration, and that the appropriate stat is removed
 *   > when the buff expires.
 */
class InvigoratingSporeCloud extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    combatants: Combatants,
  };

  statTracker!: StatTracker;
  combatants!: Combatants;

  private buffs: {
    refreshes: number;
    source: Combatant | null;
    stat: STAT;
    amount: number;
    start?: number;
    end?: number;
  }[] = [];

  constructor({ statTracker, ...options }: Options & { statTracker: StatTracker }) {
    super(options);

    this.addEventListener(
      Events.applybuff.spell(SPELLS.SPORE_TENDER_BUFF).to(SELECTED_PLAYER),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.spell(SPELLS.SPORE_TENDER_BUFF).to(SELECTED_PLAYER),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.spell(SPELLS.SPORE_TENDER_BUFF).to(SELECTED_PLAYER),
      this.onRemoveBuff,
    );
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    const stat = this.currentHighestSecondaryStat();

    const source = this.combatants.getSourceEntity(event);

    const value = getSporeTenderBuffValue(source);

    this.buffs.push({
      refreshes: 0,
      source,
      stat,
      amount: value,
      start: event.timestamp,
    });

    this.updateStats(stat, value, event);
  }

  private onRefreshBuff(event: RefreshBuffEvent) {
    const buff = this.lastMatchingBuff(event);
    if (buff) {
      buff.refreshes += 1;
    }
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    const buff = this.lastMatchingBuff(event);

    if (buff) {
      buff.end = event.timestamp;

      this.updateStats(buff.stat, -buff.amount, event);
    }
  }

  private updateStats(stat: STAT, amount: number, event: ApplyBuffEvent | RemoveBuffEvent) {
    this.statTracker.forceChangeStats(
      {
        [stat]: amount,
      },
      event,
    );
  }

  private currentHighestSecondaryStat(): STAT {
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

  private lastMatchingBuff(event: ApplyBuffEvent | RefreshBuffEvent | RemoveBuffEvent) {
    const buff = findLast(this.buffs, (b) => b.source?.id === event.sourceID && b.end == null);

    if (buff == null) {
      console.error('[InvigoratingSporeCloud] Could not find active buff', event);
      return;
    }

    return buff;
  }

  // ================ STATISTIC ================

  private statisticDropdown() {
    const rows = this.buffs.map((buff) => {
      const classSlug = (() => {
        const spec = buff.source?.spec as RetailSpec | undefined;

        if (spec == null) {
          return '';
        }

        return spec.wclClassName.replace(' ', '');
      })();

      return (
        <tr key={`${buff.source?.id}-${buff.start}-${buff.end}`}>
          <td className="text-left">
            <span className={classSlug}>{buff.source?.name ?? 'Uknown'}</span>
          </td>
          <td>{buff.amount}</td>
          <td>{getNameTranslated(buff.stat)}</td>
          <td>
            {this.owner.formatTimestamp(buff.start ?? this.owner.fight.start_time)} -{' '}
            {this.owner.formatTimestamp(buff.end ?? this.owner.fight.end_time)}
          </td>
        </tr>
      );
    });

    return (
      <table className="table table-condensed">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Source</th>
            <th>Amount</th>
            <th>Stat</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }

  private statisticTooltip() {
    return (
      <>
        Friendly healers with the <SpellLink spell={SPELLS.SPORE_TENDER_ENCHANT} /> enchant has a
        chance to grant you a buff that increases your highest secondary stat. This is is a
        breakdown of benefit you have gained from this buff.
      </>
    );
  }

  private statisticContent() {
    const summarised = this.buffs.reduce((acc, buff) => {
      let entry = acc.find((e) => e.stat === buff.stat && e.amount === buff.amount);
      if (!entry) {
        entry = {
          stat: buff.stat,
          amount: buff.amount,
          duration: 0,
        };
        acc.push(entry);
      }
      entry.duration +=
        (buff.end ?? this.owner.fight.end_time) - (buff.start ?? this.owner.fight.start_time);

      return acc;
    }, new Array<{ stat: STAT; amount: number; duration: number }>());

    return (
      <BoringSpellValueText spell={SPELLS.SPORE_TENDER_BUFF}>
        {summarised.map(({ stat, amount, duration }, index) => {
          const StatIcon = getIcon(stat);
          return (
            <Fragment key={`${stat}-${amount}`}>
              {index !== 0 && <hr />}
              <div>
                <UptimeIcon /> {formatDuration(duration)} <small>Uptime</small>
              </div>
              <div>
                <StatIcon /> {amount} <small>{getNameTranslated(stat)}</small>
              </div>
            </Fragment>
          );
        })}
      </BoringSpellValueText>
    );
  }

  statistic() {
    if (this.buffs.length === 0) {
      // This module is always active so we have to make sure to return null if there is no data
      return null;
    }

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.UNIMPORTANT(1)}
        dropdown={this.statisticDropdown()}
        tooltip={this.statisticTooltip()}
      >
        {this.statisticContent()}
      </Statistic>
    );
  }
}

export default InvigoratingSporeCloud;
