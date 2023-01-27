import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import { BadColor, GoodColor } from 'interface/guide';
import { ResourceLink } from 'interface';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { BUILDERS } from '../../constants';

export default class BuilderUse extends Analyzer {
  totalBuilderCasts = 0;
  wastedBuilderCasts = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(BUILDERS),
      this.onResourceChange,
    );
  }

  get effectiveBuilderCasts() {
    return this.totalBuilderCasts - this.wastedBuilderCasts;
  }

  get chart() {
    const items = [
      {
        color: GoodColor,
        label: 'Effective Builders',
        value: this.effectiveBuilderCasts,
      },
      {
        color: BadColor,
        label: 'Wasted Builders',
        value: this.wastedBuilderCasts,
      },
    ];

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(5)}>
        <div className="pad">
          <label>
            <ResourceLink id={RESOURCE_TYPES.COMBO_POINTS.id} /> builder usage
          </label>
          {this.chart}
        </div>
      </Statistic>
    );
  }

  private onResourceChange(event: ResourceChangeEvent) {
    this.totalBuilderCasts += 1;
    if (event.resourceChange - event.waste === 0) {
      this.wastedBuilderCasts += 1;
    }
  }
}
