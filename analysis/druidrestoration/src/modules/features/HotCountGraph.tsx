import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Module';
import BuffCountGraph, { GraphedSpellSpec } from 'parser/shared/modules/BuffCountGraph';
import Panel from 'parser/ui/Panel';

const BUFF_SPECS: GraphedSpellSpec[] = [
  { spells: [SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION], color: '200,20,200' },
  { spells: SPELLS.WILD_GROWTH, color: '00,255,00' }, // TODO make it accept format like '#rrggbb' instead
];

const CAST_SPECS: GraphedSpellSpec[] = [
  { spells: SPELLS.TRANQUILITY_CAST },
  { spells: SPELLS.FLOURISH_TALENT },
  { spells: SPELLS.CONVOKE_SPIRITS },
];

class HotCountGraph extends BuffCountGraph {
  constructor(options: Options) {
    super(options, BUFF_SPECS, CAST_SPECS);
  }

  statistic() {
    return (
      <Panel title="Hot Graph" position={100} explanation={<></>}>
        {this.plot}
      </Panel>
    );
  }
}

export default HotCountGraph;
