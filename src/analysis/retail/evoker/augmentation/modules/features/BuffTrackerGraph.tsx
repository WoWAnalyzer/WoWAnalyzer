import { Options } from 'parser/core/Module';
import BuffCountGraph, { GraphedSpellSpec } from 'parser/shared/modules/BuffCountGraph';
import SPELLS from 'common/SPELLS/evoker';
import { BREATH_OF_EONS_SPELLS } from '../../constants';
import TALENTS from 'common/TALENTS/evoker';
import { isMythicPlus } from 'common/isMythicPlus';

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
    if (isMythicPlus(this.owner.fight)) {
      buffSpecs.push({
        spells: SPELLS.EBON_MIGHT_BUFF_EXTERNAL,
        color: '#E11E6A',
      });
    } else {
      buffSpecs.push({
        spells: SPELLS.EBON_MIGHT_BUFF_PERSONAL,
        color: '#E11E6A',
      });
    }
    if (this.selectedCombatant.hasTalent(TALENTS.DUPLICATE_1_AUGMENTATION_TALENT)) {
      buffSpecs.push({
        spells: SPELLS.DUPLICATE_SELF_BUFF,
        color: '#E1CF1E',
      });
    }
    return buffSpecs;
  }

  castRuleSpecs(): GraphedSpellSpec[] {
    const castSpecs: GraphedSpellSpec[] = [];

    if (!this.selectedCombatant.hasTalent(TALENTS.DUPLICATE_1_AUGMENTATION_TALENT)) {
      castSpecs.push({ spells: BREATH_OF_EONS_SPELLS, color: '#E1CF1E' });
    }
    return castSpecs;
  }
}

export default BuffTrackerGraph;
