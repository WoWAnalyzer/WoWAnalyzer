import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { Options } from 'parser/core/Analyzer';
import CoreMitigationCheck from 'parser/shared/modules/MitigationCheck';

class MitigationCheck extends CoreMitigationCheck {
  constructor(options: Options) {
    super(options);
    this.buffCheckPhysical = [SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF.id];

    this.buffCheckPhysAndMag = [
      TALENTS.ARDENT_DEFENDER_TALENT.id,
      TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT.id,
      SPELLS.SENTINEL.id,
    ];
  }
}

export default MitigationCheck;
