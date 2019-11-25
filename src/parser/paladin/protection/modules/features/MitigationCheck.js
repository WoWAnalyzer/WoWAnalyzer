import CoreMitigationCheck from 'parser/shared/modules/MitigationCheck';
import SPELLS from 'common/SPELLS';

class MitigationCheck extends CoreMitigationCheck {
  constructor(...args){
    super(...args);
    this.buffCheckPhysical = [
      SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF.id,
    ];

    this.buffCheckPhysAndMag = [
      SPELLS.ARDENT_DEFENDER.id,
      SPELLS.GUARDIAN_OF_ANCIENT_KINGS.id,
    ];
  }

}

export default MitigationCheck;
