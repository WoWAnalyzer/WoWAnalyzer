import { formatNumber } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { TALENTS_PRIEST } from 'common/TALENTS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import isAtonement from '../core/isAtonement';
import Atonement from './Atonement';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const EVANGELISM_DURATION = 6;
const EVANGELISM_DURATION_MS = EVANGELISM_DURATION * 1000;

class Evangelism extends Analyzer {
  static dependencies = {
    atonementModule: Atonement,
  };
  _previousEvangelismCast: CastEvent | null = null;
  protected atonementModule!: Atonement;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.EVANGELISM_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.EVANGELISM_TALENT),
      this.onCast,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
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
      <Statistic
        position={STATISTIC_ORDER.CORE(0)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={
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
        }
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.EVANGELISM_TALENT}>
          <ItemHealingDone amount={evangelismStatistics.reduce((p, c) => p + c.healing, 0)} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Evangelism;
