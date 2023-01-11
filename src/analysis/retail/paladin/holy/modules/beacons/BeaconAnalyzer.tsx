import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { BEACON_TYPE, BEACON_SPELL_IDS } from '../../constants';

class BeaconAnalyzer extends Analyzer {
  beaconType: BEACON_TYPE;
  beaconBuffIds: readonly number[];

  constructor(options: Options) {
    super(options);

    if (this.selectedCombatant.hasTalent(TALENTS.BEACON_OF_FAITH_TALENT)) {
      this.beaconType = BEACON_TYPE.BEACON_OF_FAITH;
    } else if (this.selectedCombatant.hasTalent(TALENTS.BEACON_OF_VIRTUE_TALENT)) {
      this.beaconType = BEACON_TYPE.BEACON_OF_VIRTUE;
    } else {
      this.beaconType = BEACON_TYPE.BEACON_OF_LIGHT;
    }
    this.beaconBuffIds = BEACON_SPELL_IDS[this.beaconType];
  }
}

export default BeaconAnalyzer;
