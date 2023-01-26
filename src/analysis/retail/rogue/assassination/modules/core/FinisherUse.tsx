import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { BadColor, GoodColor } from 'interface/guide';
import { ResourceLink } from 'interface';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import getResourceSpent from 'parser/core/getResourceSpent';
import { FINISHERS, getMaxComboPoints } from '../../constants';

export default class FinisherUse extends Analyzer {
  totalFinisherCasts = 0;
  lowCpFinisherCasts = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FINISHERS), this.onCast);
  }

  get maxCpFinishers() {
    return this.totalFinisherCasts - this.lowCpFinisherCasts;
  }

  get chart() {
    const items = [
      {
        color: GoodColor,
        label: 'Max CP Finishers',
        value: this.maxCpFinishers,
        tooltip: (
          <>This includes finishers cast at {getMaxComboPoints(this.selectedCombatant) - 1} CPs.</>
        ),
      },
      {
        color: BadColor,
        label: 'Low CP Finishers',
        value: this.lowCpFinisherCasts,
      },
    ];

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(6)}>
        <div className="pad">
          <label>
            <ResourceLink id={RESOURCE_TYPES.COMBO_POINTS.id} /> spender usage
          </label>
          {this.chart}
        </div>
      </Statistic>
    );
  }

  private onCast(event: CastEvent) {
    const cpsSpent = getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS);
    if (cpsSpent === 0) {
      return;
    }
    this.totalFinisherCasts += 1;
    if (cpsSpent < getMaxComboPoints(this.selectedCombatant) - 1) {
      this.lowCpFinisherCasts += 1;
    }
  }
}
