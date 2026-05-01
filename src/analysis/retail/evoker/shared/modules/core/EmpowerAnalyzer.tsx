import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, EmpowerEndEvent } from 'parser/core/Events';
import { EMPOWERS } from '../../constants';
import SpellLink from 'interface/SpellLink';
import EmpowerNormalizer, {
  getEmpowerEndEvent,
  isFromTipTheScales,
} from '../normalizers/EmpowerNormalizer';
import { TALENTS_EVOKER as TALENTS } from 'common/TALENTS';
import { StackedBar, StackedBarSegment } from 'interface/guide/components';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SPELLS from 'common/SPELLS';

/** H Value for the HSL Color Type */
const COLORMAP = {
  [SPELLS.FIRE_BREATH.id]: 0,
  [SPELLS.FIRE_BREATH_FONT.id]: 0,
  [SPELLS.DREAM_BREATH.id]: 122,
  [SPELLS.DREAM_BREATH_FONT.id]: 122,
  [TALENTS.DREAM_BREATH_TALENT.id]: 122,
  [SPELLS.UPHEAVAL.id]: 20,
  [SPELLS.UPHEAVAL_FONT.id]: 20,
  [SPELLS.ETERNITY_SURGE.id]: 190,
  [SPELLS.ETERNITY_SURGE_FONT.id]: 190,
};

const DEBUG = false;

interface EmpowerChart {
  spellId: number;
  segments: StackedBarSegment[];
}
interface EmpowerData {
  spellId: number;
  /** 1,2,3,4,Tip */
  rankCounts: [number, number, number, number, number];
}

class EmpowerAnalyzer extends Analyzer {
  static dependencies = {
    ...Analyzer.dependencies,
    EmpowerNormalizer: EmpowerNormalizer,
  };

  private data: EmpowerData[] = [];
  private chartSegments: EmpowerChart[] = [];

  private currentEmpower: CastEvent | undefined = undefined;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.empowerEnd.by(SELECTED_PLAYER), this.onEmpowerEnd);
    this.addEventListener(Events.fightend, this.finalize);
  }

  initializeData(spellId: number) {
    const datum: EmpowerData = {
      spellId: spellId,
      rankCounts: [0, 0, 0, 0, 0],
    };
    this.data.push(datum);
    return datum;
  }

  getDataBySpellId(spellId: number) {
    return this.data.find((x) => x.spellId == spellId);
  }

  addCount(spellId: number, empowerRank: number) {
    let datum = this.getDataBySpellId(spellId);
    if (datum == undefined) datum = this.initializeData(spellId);
    datum.rankCounts[empowerRank]++;
  }

  onCast(event: CastEvent) {
    if (!EMPOWERS.includes(event.ability.guid)) return;

    if (isFromTipTheScales(event)) {
      const end = getEmpowerEndEvent(event);
      if (end !== undefined) {
        this.addCount(event.ability.guid, 4);
      }
    } else this.currentEmpower = event;
  }

  onEmpowerEnd(event: EmpowerEndEvent) {
    if (this.currentEmpower !== undefined) {
      this.addCount(this.currentEmpower.ability.guid, event.empowermentLevel - 1);
      this.currentEmpower = undefined;
    }
  }

  finalize() {
    this.chartSegments = this.data.map(this.generateChartSegments);
    DEBUG && console.log('Data', this.data);
  }

  generateChartSegments(empowerData: EmpowerData): EmpowerChart {
    DEBUG && console.log(empowerData.spellId, COLORMAP[empowerData.spellId]);
    const chartSegments: StackedBarSegment[] = [
      {
        color: `hsl(${COLORMAP[empowerData.spellId]}, 40%, 30%)`,
        label: 'Rank 1',
        value: empowerData.rankCounts[0],
        tooltip: <>{empowerData.rankCounts[0]} casts finished at Rank 1.</>,
      },
      {
        color: `hsl(${COLORMAP[empowerData.spellId]}, 45%, 40%)`,
        label: 'Rank 2',
        value: empowerData.rankCounts[1],
        tooltip: <>{empowerData.rankCounts[1]} casts finished at Rank 2.</>,
      },
      {
        color: `hsl(${COLORMAP[empowerData.spellId]}, 50%, 50%)`,
        label: 'Rank 3',
        value: empowerData.rankCounts[2],
        tooltip: <>{empowerData.rankCounts[2]} casts finished at Rank 3.</>,
      },
      {
        color: `hsl(${COLORMAP[empowerData.spellId]}, 55%, 60%)`,
        label: 'Rank 4',
        value: empowerData.rankCounts[3],
        tooltip: <>{empowerData.rankCounts[3]} casts finished at Rank 4.</>,
      },
      {
        color: `hsl(${COLORMAP[empowerData.spellId]}, 60%, 70%)`,
        label: TALENTS.TIP_THE_SCALES_TALENT.name,
        value: empowerData.rankCounts[4],
        tooltip: (
          <>
            {empowerData.rankCounts[4]} casts finished at maximum rank via{' '}
            <SpellLink spell={TALENTS.TIP_THE_SCALES_TALENT.id} />.
          </>
        ),
      },
    ];
    return {
      spellId: empowerData.spellId,
      segments: chartSegments,
    };
  }
  generateChart(empowerChart: EmpowerChart) {
    return (
      <div>
        <SpellLink spell={empowerChart.spellId} />
        <div style={{ paddingBottom: 15 }}>
          <StackedBar segments={empowerChart.segments} minSegmentPercent={0.1} hideLegend={true} />
        </div>
      </div>
    );
  }
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <div className="pad">
          <label>Empower Usage</label>
          {this.chartSegments.map(this.generateChart)}
        </div>
      </Statistic>
    );
  }
}

export default EmpowerAnalyzer;
