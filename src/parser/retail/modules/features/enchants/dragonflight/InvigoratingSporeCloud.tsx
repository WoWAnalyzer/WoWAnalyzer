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

class InvigoratingSporeCloud extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    combatants: Combatants,
  };

  statTracker!: StatTracker;
  combatants!: Combatants;

  buffs: {
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
      Events.applybuff.spell(SPELLS.INVIGORATING_SPORE_CLOUD).to(SELECTED_PLAYER),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.spell(SPELLS.INVIGORATING_SPORE_CLOUD).to(SELECTED_PLAYER),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.spell(SPELLS.INVIGORATING_SPORE_CLOUD).to(SELECTED_PLAYER),
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
  }

  private onRefreshBuff(event: RefreshBuffEvent) {
    const buff = findLast(this.buffs, (b) => b.source?.id === event.sourceID && b.end == null);

    if (buff == null) {
      console.error('[InvigoratingSporeCloud] Could not find buff to refresh', event);
      return;
    }

    buff.refreshes += 1;
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    const buff = findLast(this.buffs, (b) => b.source?.id === event.sourceID && b.end == null);

    if (buff == null) {
      console.error('[InvigoratingSporeCloud] Could not find buff to remove', event);
      return;
    }

    buff.end = event.timestamp;
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

  private dropdown() {
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
        <tbody>
          {this.buffs.map((buff) => {
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
          })}
        </tbody>
      </table>
    );
  }

  private tooltip() {
    return (
      <>
        Friendly healers with the <SpellLink spell={SPELLS.SPORE_TENDER_ENCHANT} /> enchant has a
        chance to grant you a buff that increases your highest secondary stat. This is is a
        breakdown of benefit you have gained from this buff.
      </>
    );
  }

  statistic() {
    if (this.buffs.length === 0) {
      return null;
    }

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
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.UNIMPORTANT(1)}
        dropdown={this.dropdown()}
        tooltip={this.tooltip()}
      >
        <BoringSpellValueText spell={SPELLS.INVIGORATING_SPORE_CLOUD}>
          {summarised.map(({ stat, amount, duration }) => {
            const StatIcon = getIcon(stat);
            return (
              <div key={`${stat}-${amount}`}>
                <UptimeIcon /> {formatDuration(duration)} <small>Uptime</small> <StatIcon />{' '}
                {amount} <small>{getNameTranslated(stat)}</small>
              </div>
            );
          })}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default InvigoratingSporeCloud;
