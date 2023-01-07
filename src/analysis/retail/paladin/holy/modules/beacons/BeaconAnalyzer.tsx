import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { BeaconType, BEACON_TYPES } from '../../constants';

class BeaconAnalyzer extends Analyzer {
  beaconType: BeaconType;
  beaconBuffIds: readonly number[];

  constructor(options: Options) {
    super(options);

    if (this.selectedCombatant.hasTalent(TALENTS.BEACON_OF_FAITH_TALENT)) {
      this.beaconType = 'BEACON_OF_FATH';
    } else if (this.selectedCombatant.hasTalent(TALENTS.BEACON_OF_VIRTUE_TALENT)) {
      this.beaconType = 'BEACON_OF_VIRTUE';
    } else {
      this.beaconType = 'BEACON_OF_LIGHT';
    }
    this.beaconBuffIds = BEACON_TYPES[this.beaconType];
  }
}

export default BeaconAnalyzer;
