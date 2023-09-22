import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import TALENTS from 'common/TALENTS/paladin';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import BoringValueText from 'parser/ui/BoringValueText';
import { SpellIcon } from 'interface';

import BaseChart from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import { NOMINAL, QUANTITATIVE } from 'vega-lite/build/src/type';

class FillerFlashOfLight extends Analyzer {
  distances: number[] = [];
  distanceCount = 0;

  maxDistance = 0;

  sourceX: number | undefined;
  sourceY: number | undefined;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.LIGHT_OF_DAWN_TALENT),
      this.cast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_DAWN_HEAL),
      this.onHeal,
    );
  }

  cast(event: CastEvent) {
    this.sourceX = event.x;
    this.sourceY = event.y;
  }

  onHeal(event: HealEvent) {
    if (!this.sourceX && !this.sourceY) {
      return;
    }

    this.distances.push(
      this.calculateDistance(this.sourceX as number, this.sourceY as number, event.x, event.y),
    );
    this.distanceCount += 1;
  }

  calculateDistance(x1: number, y1: number, x2: number, y2: number) {
    return Number((Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) / 100).toFixed(2));
  }

  get plot() {
    // Bucket the data up
    const buckets = new Map<number, number>();

    this.distances.forEach((e) => {
      const bucket = Math.min(Math.floor(e / 5) * 5, 40);
      const newAmount = (buckets.get(bucket) ?? 0) + 1;
      buckets.set(bucket, newAmount);
    });

    // transform the data to vega-lite style
    const normalized: { bucket: string; amount: number }[] = [];

    buckets.forEach((value, key) => {
      normalized.push({
        bucket: `${key}-${key + 5}`,
        amount: value,
      });
    });

    // build the spec
    const spec: VisualizationSpec = {
      data: {
        values: normalized,
      },
      mark: 'bar',
      encoding: {
        x: {
          field: 'bucket',
          type: NOMINAL,
          axis: { labelAngle: -45 },
          title: 'Distance',
          sort: null,
        },
        y: { field: 'amount', type: QUANTITATIVE, title: 'Hit' },
      },
    };

    // make the chart
    return <BaseChart spec={spec} data={normalized} />;
  }

  statistic() {
    this.distances.sort((a, b) => a - b);
    const distanceSum = this.distances.reduce((previous, current) => previous + current, 0);

    return (
      <Statistic key="Statistic" position={STATISTIC_ORDER.CORE(10)} size="flexible">
        <BoringValueText
          label={
            <>
              <SpellIcon spell={TALENTS.LIGHT_OF_DAWN_TALENT} /> Average LoD Distance
            </>
          }
        >
          {this.plot} <br />
          {(distanceSum / this.distanceCount).toFixed(2)} <small>yards</small>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default FillerFlashOfLight;
