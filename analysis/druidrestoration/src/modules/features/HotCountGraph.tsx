import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import Events from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BuffCountGraph, { GraphedSpellSpec } from 'parser/shared/modules/BuffCountGraph';
import Panel from 'parser/ui/Panel';

import ConvokeSpiritsResto from '../../modules/shadowlands/covenants/ConvokeSpiritsResto';

const CONVOKE_SPEC_NAME = 'Convoke';
const CONVOKE_WITH_FLOURISH_SPEC_NAME = 'Convoke w/ Flourish';

class HotCountGraph extends BuffCountGraph {
  static dependencies = {
    convokeSpirits: ConvokeSpiritsResto,
  };
  convokeSpirits!: ConvokeSpiritsResto;
  // custom specs to show a different color for Convokes that do and don't proc Flourish
  convokeSpec!: GraphedSpellSpec;
  convokeWithFlourishSpec!: GraphedSpellSpec;

  constructor(options: Options) {
    super(options);
    if (this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id)) {
      this.addEventListener(Events.fightend, this.onFightEndConvokeCount);
    }
  }

  onFightEndConvokeCount() {
    this.convokeSpirits.convokeTracker.forEach((cast) => {
      if (cast.spellIdToCasts[SPELLS.FLOURISH_TALENT.id]) {
        this.addRuleLine(CONVOKE_WITH_FLOURISH_SPEC_NAME, cast.timestamp);
      } else {
        this.addRuleLine(CONVOKE_SPEC_NAME, cast.timestamp);
      }
    });
  }

  buffSpecs(): GraphedSpellSpec[] {
    const buffSpecs: GraphedSpellSpec[] = [];
    buffSpecs.push({
      spells: [SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION],
      color: '#900090',
    });
    buffSpecs.push({ spells: SPELLS.WILD_GROWTH, color: '#00b000' });
    this.selectedCombatant.hasTalent(SPELLS.CENARION_WARD_TALENT) &&
      buffSpecs.push({ spells: SPELLS.CENARION_WARD_HEAL, color: '#44ffcc' });
    this.selectedCombatant.hasCovenant(COVENANTS.NECROLORD.id) &&
      buffSpecs.push({
        spells: [SPELLS.ADAPTIVE_SWARM_HEAL, SPELLS.ADAPTIVE_SWARM_DAMAGE],
        color: '#cc7722',
      });
    return buffSpecs;
  }

  castRuleSpecs(): GraphedSpellSpec[] {
    const castSpecs: GraphedSpellSpec[] = [];
    castSpecs.push({ spells: SPELLS.TRANQUILITY_CAST, color: '#bbbbbb' });
    this.selectedCombatant.hasTalent(SPELLS.FLOURISH_TALENT) &&
      castSpecs.push({ spells: SPELLS.FLOURISH_TALENT, color: '#ffbb22' });
    if (this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id)) {
      this.convokeSpec = { name: 'Convoke', spells: [], color: '#0000bb' };
      castSpecs.push(this.convokeSpec);
      this.convokeWithFlourishSpec = { name: 'Convoke w/ Flourish', spells: [], color: '#00aacc' };
      castSpecs.push(this.convokeWithFlourishSpec);
    }
    return castSpecs;
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
