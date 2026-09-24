import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import { Options } from 'parser/core/Analyzer';
import BuffStackTracker from 'parser/shared/modules/BuffStackTracker';

class EssenceOfTheBloodQueenStackTracker extends BuffStackTracker {
  static trackedBuff = SPELLS.ESSENCE_OF_THE_BLOOD_QUEEN_BUFF;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.VAMPIRIC_STRIKE_TALENT);
  }
}

export default EssenceOfTheBloodQueenStackTracker;
