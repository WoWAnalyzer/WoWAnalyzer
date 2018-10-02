import SPELLS from 'common/SPELLS';
import GenericStatProc, { azeriteStats } from 'parser/core/modules/spells/bfa/azeritetraits/GenericStatProc';
import STAT from 'parser/core/modules/features/STAT';

export const STAT_TRACKER = {
  mastery: combatant => azeriteStats(combatant.traitsBySpellId[SPELLS.SYNERGISTIC_GROWTH.id]).stat,
};

/**
 * Synergistic Growth
 * Gain x mastery while active
 *
 * Example report: /report/4qXRxW1fYLPaJgMA/7-Mythic+Zul+-+Wipe+1+(1:25)/8-Monkacarl
 */
class SynergisticGrowth extends GenericStatProc {
  constructor(...args) {
    super(SPELLS.SYNERGISTIC_GROWTH.id, SPELLS.SYNERGISTIC_GROWTH_BUFF.id, STAT.MASTERY, ...args);
  }
}

export default SynergisticGrowth;
