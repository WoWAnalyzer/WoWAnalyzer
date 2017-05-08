import Module from 'Parser/Core/Module';

import TARGET_SPEC_ID from '../../TARGET_SPEC_ID';

class VerifySpec extends Module {
  on_initialized() {
    if (!this.owner.selectedCombatant) {
      this.owner.error = 'The selected player could not be found in this fight. Make sure the log is recorded with Advanced Combat Logging enabled.';
    } else if (this.owner.selectedCombatant.specId !== TARGET_SPEC_ID) {
      this.owner.error = 'The selected player does not appear to be a Holy Paladin.';
    }

    this.active = false;
  }
}

export default VerifySpec;
