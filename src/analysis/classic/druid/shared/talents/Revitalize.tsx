
import fetchWcl from 'common/fetchWclApi';
import { formatNumber } from 'common/format';
import { SpellIcon } from 'interface';
import { SpecIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import Events, { EventType, AnyEvent, HealEvent, ResourceChangeEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Combatants from 'parser/shared/modules/Combatants';
import { WCLEventsResponse } from 'common/WCL_TYPES';
import LazyLoadStatisticBox from 'parser/ui/LazyLoadStatisticBox';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPELLS from 'common/SPELLS/classic/druid';

interface ResourcesByPlayer {
  [playerId: number]: {
    count: number;
    mana: number;
    energy: number;
    rage: number;
    runicPower: number;
  };
}

const TIMESTAMP_TOLERANCE = 40;

function hasCorrespondingHeal(events: HealEvent[], evt: ResourceChangeEvent): boolean {
  if (!events) {
    return false;
  }

  let start = 0;
  let end = events.length - 1;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);

    if (Math.abs(events[mid].timestamp - evt.timestamp) < TIMESTAMP_TOLERANCE) {
      return true;
    }

    if (evt.timestamp < events[mid].timestamp) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }

  return false;
}

class Revitalize extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  resourcesByPlayer: ResourcesByPlayer = {};
  eligibleCasts: { [playerId: number]: HealEvent[] } = {};

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.talentPoints[2] >= 43;
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.REJUVENATION, SPELLS.WILD_GROWTH]),
      this.onHealCast,
    );
  }

  onHealCast(event: HealEvent) {
    if (!this.eligibleCasts[event.targetID]) {
      this.eligibleCasts[event.targetID] = [];
    }

    this.eligibleCasts[event.targetID].push(event);
  }

  get filter() {
    return `ability.name='Revitalize'`;
  }

  get totalProcs(): number {
    return Object.values(this.resourcesByPlayer).reduce(
      (total: number, current) => (total += current.count),
      0,
    );
  }

  get resourcesPerPlayer(): {
    [playerId: number]: {
      player: Combatant;
      count: number;
      power: { mana: number; energy: number; rage: number; runicPower: number };
    };
  } {
    return Object.assign(
      {},
      ...Object.values(this.combatants.players).map((player) => ({
        [player.id]: {
          player: player,
          count: this.resourcesByPlayer[player.id]?.count ?? 0,
          power: {
            mana: this.resourcesByPlayer[player.id]?.mana ?? 0,
            energy: this.resourcesByPlayer[player.id]?.energy ?? 0,
            rage: this.resourcesByPlayer[player.id]?.rage ?? 0,
            runicPower: this.resourcesByPlayer[player.id]?.runicPower ?? 0,
          },
        },
      })),
    );
  }

  resourceEventReduce = (totals: ResourcesByPlayer, evt: AnyEvent) => {
    if (
      evt.type !== EventType.ResourceChange || // Not a resource event
      !hasCorrespondingHeal(this.eligibleCasts[evt.targetID], evt)
    ) {
      return totals;
    }

    if (!totals[evt.targetID]) {
      totals[evt.targetID] = { count: 0, mana: 0, energy: 0, rage: 0, runicPower: 0 };
    }

    totals[evt.targetID] = {
      count: totals[evt.targetID].count + 1,
      mana:
        totals[evt.targetID].mana +
        (evt.resourceChangeType === RESOURCE_TYPES.MANA.id ? evt.resourceChange : 0),
      energy:
        totals[evt.targetID].energy +
        (evt.resourceChangeType === RESOURCE_TYPES.ENERGY.id ? evt.resourceChange : 0),
      rage:
        totals[evt.targetID].rage +
        (evt.resourceChangeType === RESOURCE_TYPES.RAGE.id ? evt.resourceChange : 0),
      runicPower:
        totals[evt.targetID].runicPower +
        (evt.resourceChangeType === RESOURCE_TYPES.RUNIC_POWER.id ? evt.resourceChange : 0),
    };

    return totals;
  };

  load() {
    return Promise.all([
      // Mana
      fetchWcl<WCLEventsResponse>(`report/events/resources/${this.owner.report.code}`, {
        start: this.owner.fight.start_time,
        end: this.owner.fight.end_time,
        abilityid: 100,
        filter: this.filter,
      }).then((json) => {
        this.resourcesByPlayer = json.events.reduce(
          this.resourceEventReduce,
          this.resourcesByPlayer,
        );
      }),

      // Energy
      fetchWcl<WCLEventsResponse>(`report/events/resources/${this.owner.report.code}`, {
        start: this.owner.fight.start_time,
        end: this.owner.fight.end_time,
        abilityid: 103,
        filter: this.filter,
      }).then((json) => {
        this.resourcesByPlayer = json.events.reduce(
          this.resourceEventReduce,
          this.resourcesByPlayer,
        );
      }),

      // Rage
      fetchWcl<WCLEventsResponse>(`report/events/resources/${this.owner.report.code}`, {
        start: this.owner.fight.start_time,
        end: this.owner.fight.end_time,
        abilityid: 101,
        filter: this.filter,
      }).then((json) => {
        this.resourcesByPlayer = json.events.reduce(
          this.resourceEventReduce,
          this.resourcesByPlayer,
        );
      }),

      // Runic Power
      fetchWcl<WCLEventsResponse>(`report/events/resources/${this.owner.report.code}`, {
        start: this.owner.fight.start_time,
        end: this.owner.fight.end_time,
        abilityid: 106,
        filter: this.filter,
      }).then((json) => {
        this.resourcesByPlayer = json.events.reduce(
          this.resourceEventReduce,
          this.resourcesByPlayer,
        );
      }),
    ]);
  }

  statistic() {
    return (
      <LazyLoadStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        loader={this.load.bind(this)}
        position={STATISTIC_ORDER.UNIMPORTANT(89)}
        label="Revitalize"
        icon={<SpellIcon id={SPELLS.REVITALIZE_MANA} />}
        value={
          <>
            {this.totalProcs} procs{' '}
            <small>
              ({(this.totalProcs / (this.owner.fightDuration / 1000 / 60)).toFixed(1)} ppm)
            </small>
          </>
        }
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>
                <>Player</>
              </th>
              <th>Procs</th>
              <th>Power</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(this.resourcesPerPlayer)
              .sort((a, b) => b.count - a.count)
              .filter((p) => p.count > 0)
              .map((p) => {
                const specClassName = p.player.player.type.replace(' ', '');

                return (
                  <tr key={p.player.id}>
                    <th className={specClassName}>
                      <SpecIcon icon={p.player.player.icon} /> {p.player.name}
                    </th>
                    <td>{p.count > 0 && <>{formatNumber(p.count)}</>}</td>
                    <td>
                      {p.power.mana > 0 && (
                        <>
                          {formatNumber(p.power.mana)} mana
                          <br />
                        </>
                      )}
                      {p.power.rage > 0 && (
                        <>
                          {formatNumber(p.power.rage)} rage
                          <br />
                        </>
                      )}
                      {p.power.energy > 0 && (
                        <>
                          {formatNumber(p.power.energy)} energy
                          <br />
                        </>
                      )}
                      {p.power.runicPower > 0 && (
                        <>
                          {formatNumber(p.power.runicPower)} runic power
                          <br />
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </LazyLoadStatisticBox>
    );
  }
}

export default Revitalize;
