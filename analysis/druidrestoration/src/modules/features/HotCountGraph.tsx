import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { Options } from 'parser/core/Module';
import BuffCountGraph, { GraphedSpellSpec } from 'parser/shared/modules/BuffCountGraph';
import Panel from 'parser/ui/Panel';

class HotCountGraph extends BuffCountGraph {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(options: Options) {
    super(options);
  }

  buffSpecs(): GraphedSpellSpec[] {
    const buffSpecs: GraphedSpellSpec[] = [];
    buffSpecs.push({
      spells: [SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION],
      color: '#900090',
    });
    buffSpecs.push({ spells: SPELLS.WILD_GROWTH, color: '#00b000' });
    this.selectedCombatant.hasTalent(SPELLS.CENARION_WARD_TALENT) &&
      buffSpecs.push({ spells: SPELLS.CENARION_WARD_HEAL, color: '#00ccaa' });
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
    this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id) &&
      castSpecs.push({ spells: SPELLS.CONVOKE_SPIRITS, color: '#0000bb' });
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
