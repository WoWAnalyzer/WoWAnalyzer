import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Haste from 'parser/shared/modules/Haste';
import { TIERS } from 'game/TIERS';

const HASTE_BUFF = 0.1;
const HASTE_BUFFS = [
  SPELLS.JADE_SERPENTS_BLESSING.id,
  SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY.id,
  SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF.id,
];

class T34ConduitTier extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.TWW3);

    if (!this.active) {
      return;
    }

    const haste = options.haste as Haste;
    for (const buff of HASTE_BUFFS) {
      haste.addHasteBuff(buff, HASTE_BUFF);
    }
  }
}

export default T34ConduitTier;
