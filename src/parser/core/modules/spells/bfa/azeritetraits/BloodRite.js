import SPELLS from 'common/SPELLS';
import GenericStatProc, { azeriteStats } from 'parser/core/modules/spells/bfa/azeritetraits/GenericStatProc';
import STAT from 'parser/core/modules/features/STAT';

export const STAT_TRACKER = {
  haste: combatant => azeriteStats(combatant.traitsBySpellId[SPELLS.BLOOD_RITE.id], SPELLS.BLOOD_RITE.id).stat,
};

/**
 * Blood Rite
 * Gain x haste while active
 *
 * Example report: https://www.warcraftlogs.com/reports/k4bAJZKWVaGt12j9#fight=3&type=auras&source=14
 */
class BloodRite extends GenericStatProc {
  constructor(...args) {
    super(SPELLS.BLOOD_RITE.id, SPELLS.BLOOD_RITE_BUFF.id, STAT.HASTE, ...args);
  }
}

export default BloodRite;
