import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { TooltipElement } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventHistory from 'parser/shared/modules/EventHistory';
import StatisticBox from 'parser/ui/StatisticBox';

import GlobalCooldown from '../core/GlobalCooldown';
import isAtonement from '../core/isAtonement';
import Atonement from './Atonement';

const EVANGELISM_DURATION = 6;
const EVANGELISM_DURATION_MS = EVANGELISM_DURATION * 1000;

class Evangelism extends Analyzer {
  static dependencies = {
    atonementModule: Atonement,
    eventHistory: EventHistory,
    globalCooldown: GlobalCooldown,
  };
  protected eventHistory!: EventHistory;
  _previousEvangelismCast: CastEvent | null = null;
  protected atonementModule!: Atonement;
  protected globalCooldown!: GlobalCooldown;

  evangelismRamps: CastEvent[][];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.EVANGELISM_TALENT.id);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EVANGELISM_TALENT),
      this.onCast,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.evangelismRamps = [];
  }

  _evangelismStatistics: {
    [timestamp: number]: {
      count: number;
      atonementSeconds: number;
      healing: number;
    };
  } = {};

  get evangelismStatistics() {
    return Object.keys(this._evangelismStatistics)
      .map(Number)
      .map((key: number) => this._evangelismStatistics[key]);
  }

  onCast(event: CastEvent) {
    this._previousEvangelismCast = event;
    const atonedPlayers = this.atonementModule.numAtonementsActive;
    const rampHistory = this.eventHistory
      .last(30, 20000, Events.cast.by(SELECTED_PLAYER))
      .filter(
        (cast) =>
          !CASTS_THAT_ARENT_CASTS.includes(cast.ability.guid) &&
          this.globalCooldown.isOnGlobalCooldown(cast.ability.guid),
      );
    this.evangelismRamps.push(rampHistory);
    this._evangelismStatistics[event.timestamp] = {
      count: atonedPlayers,
      atonementSeconds: atonedPlayers * EVANGELISM_DURATION,
      healing: 0,
    };
  }

  onHeal(event: HealEvent) {
    if (isAtonement(event)) {
      const target = this.atonementModule.currentAtonementTargets.find(
        (id) => id.target === event.targetID,
      );
      // Pets, guardians, etc.
      if (!target) {
        return;
      }

      // Add all healing that shouldn't exist to expiration
      if (
        event.timestamp > target.atonementExpirationTimestamp &&
        event.timestamp < target.atonementExpirationTimestamp + EVANGELISM_DURATION_MS &&
        this._previousEvangelismCast
      ) {
        this._evangelismStatistics[this._previousEvangelismCast.timestamp].healing +=
          event.amount + (event.absorbed || 0);
      }
    }
  }

  statistic() {
    const evangelismStatistics = this.evangelismStatistics;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EVANGELISM_TALENT.id} />}
        value={`${formatNumber(
          (evangelismStatistics.reduce((total, c) => total + c.healing, 0) /
            this.owner.fightDuration) *
            1000,
        )} HPS`}
        label={
          <TooltipElement
            content={`Evangelism accounted for approximately ${formatPercentage(
              this.owner.getPercentageOfTotalHealingDone(
                evangelismStatistics.reduce((p, c) => p + c.healing, 0),
              ),
            )}% of your healing.`}
          >
            Evangelism contribution
          </TooltipElement>
        }
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Cast</th>
              <th>Healing</th>
              <th>Duration</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {this.evangelismStatistics.map((evangelism, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{formatNumber(evangelism.healing)}</td>
                <td>{evangelism.atonementSeconds}s</td>
                <td>{evangelism.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StatisticBox>
    );
  }
}

type evangelismRamps = { evangelismRamps: CastEvent[][] };

export const EvangelismApplicators = (evangelismRamps: evangelismRamps) => {
  const evangelisms = Object.values(evangelismRamps);
  const casts = evangelisms.map((evangelism) => (
    <>
      <div className="py-7">
        {evangelism.map((cast) => (
          <>
            <br />
            <div>
              {cast.map((spell) => (
                <SpellIcon style={{ height: '42px' }} id={spell.ability.guid} key={0} />
              ))}
            </div>
          </>
        ))}
      </div>
    </>
  ));
  return <>{casts}</>;
};
export default Evangelism;
