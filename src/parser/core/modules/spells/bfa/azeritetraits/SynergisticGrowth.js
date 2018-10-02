import SPELLS from 'common/SPELLS';
import GenericStatProc, { azeriteStats } from 'parser/core/modules/spells/bfa/azeritetraits/GenericStatProc';
import STAT from 'parser/core/modules/features/STAT';

export const STAT_TRACKER = {
  mastery: combatant => azeriteStats(combatant.traitsBySpellId[SPELLS.SYNERGISTIC_GROWTH.id], SPELLS.SYNERGISTIC_GROWTH.id).stat,
};

/**
 * Synergistic Growth
 * Gain x mastery while active
 *
 * Example report Monk:   /report/4qXRxW1fYLPaJgMA/7-Mythic+Zul+-+Wipe+1+(1:25)/8-Monkacarl
 * Example report Druid:  /report/8CVY9f42cBRxZPMT/46-Mythic+Fetid+Devourer+-+Kill+(5:03)/29-Dunao
 * Example report Priest: /report/DfJ2TbtmA8BHNcWK/20-Mythic+Zek'voz+-+Kill+(9:48)/18-Fearrful
 */
class SynergisticGrowth extends GenericStatProc {
  constructor(...args) {
    super(SPELLS.SYNERGISTIC_GROWTH.id, SPELLS.SYNERGISTIC_GROWTH_BUFF.id, STAT.MASTERY, ...args);
  }
}

export default SynergisticGrowth;
