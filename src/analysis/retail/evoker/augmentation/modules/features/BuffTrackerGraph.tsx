/* eslint-disable @typescript-eslint/no-useless-constructor */
import { Options } from 'parser/core/Module';
import BuffCountGraph, { GraphedSpellSpec } from 'parser/shared/modules/BuffCountGraph';
import SPELLS from 'common/SPELLS/evoker';
import { BREATH_OF_EONS_SPELLS } from '../../constants';

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
      spells: SPELLS.EBON_MIGHT_BUFF_EXTERNAL,
      color: '#E11E6A',
    });
    return buffSpecs;
  }

  castRuleSpecs(): GraphedSpellSpec[] {
    const castSpecs: GraphedSpellSpec[] = [{ spells: BREATH_OF_EONS_SPELLS, color: '#E1CF1E' }];
    return castSpecs;
  }
}

export default BuffTrackerGraph;
