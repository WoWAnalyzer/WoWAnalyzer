import { TALENTS_HUNTER } from 'common/TALENTS';
import { Options } from 'parser/core/Analyzer';
import CoreHaste from 'parser/shared/modules/Haste';

class Haste extends CoreHaste {
  constructor(options: Options) {
    super(options);

    const triggerFingerRanks = this.selectedCombatant.getTalentRank(
      TALENTS_HUNTER.TRIGGER_FINGER_TALENT,
    );

    if (triggerFingerRanks > 0) {
      const newHaste = Haste.addHaste(this.current, triggerFingerRanks * 0.01);
      this._triggerChangeHaste(null, this.current, newHaste);
      this.current = newHaste;
    }
  }
}

export default Haste;
