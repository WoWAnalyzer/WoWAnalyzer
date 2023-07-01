/* eslint-disable @typescript-eslint/no-useless-constructor */
import { Options } from 'parser/core/Module';
import BuffCountGraph, { GraphedSpellSpec } from 'parser/shared/modules/BuffCountGraph';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';

class BuffTrackerGraph extends BuffCountGraph {
  static dependencies = {
    ...BuffCountGraph.dependencies,
  };
  constructor(options: Options) {
    super(options);
  }

  buffSpecs(): GraphedSpellSpec[] {
    const buffSpecs: GraphedSpellSpec[] = [];
    buffSpecs.push({ spells: SPELLS.PRESCIENCE_BUFF, color: '#1ECBE1' });
    buffSpecs.push({
      spells: TALENTS.EBON_MIGHT_TALENT,
      color: '#E11E6A',
    });
    return buffSpecs;
  }

  castRuleSpecs(): GraphedSpellSpec[] {
    const castSpecs: GraphedSpellSpec[] = [];
    castSpecs.push({ spells: TALENTS.BREATH_OF_EONS_TALENT, color: '#E1CF1E' });
    return castSpecs;
  }
}

export default BuffTrackerGraph;
