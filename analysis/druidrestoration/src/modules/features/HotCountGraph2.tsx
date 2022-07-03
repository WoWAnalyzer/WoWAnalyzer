import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Module';
import BuffCountGraph2, { GraphedSpellSpec } from 'parser/shared/modules/BuffCountGraph2';
import Panel from 'parser/ui/Panel';

const BUFF_SPECS: GraphedSpellSpec[] = [
  { spells: [SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION], color: '#900090' },
  { spells: SPELLS.WILD_GROWTH, color: '#00b000' },
];

// const CAST_SPECS: GraphedSpellSpec[] = [
//   { spells: SPELLS.TRANQUILITY_CAST },
//   { spells: SPELLS.FLOURISH_TALENT },
//   { spells: SPELLS.CONVOKE_SPIRITS },
// ];

class HotCountGraph2 extends BuffCountGraph2 {
  constructor(options: Options) {
    super(options, BUFF_SPECS);
  }

  statistic() {
    return (
      <Panel title="Hot Graph" position={100} explanation={<></>}>
        {this.plot}
      </Panel>
    );
  }
}

export default HotCountGraph2;
