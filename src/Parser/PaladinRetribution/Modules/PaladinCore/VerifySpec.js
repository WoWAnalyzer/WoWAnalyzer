import Module from 'Parser/Core/Module';

import CONFIG from '../../CONFIG';

class VerifySpec extends Module {
  on_initialized() {
    if (!this.owner.selectedCombatant) {
      this.owner.error = 'The selected player could not be found in this fight. Make sure the log is recorded with Advanced Combat Logging enabled.';
    } else if (this.owner.selectedCombatant.specId !== CONFIG.spec.id) {
      this.owner.error = `The selected player does not appear to be a ${CONFIG.spec.specName} ${CONFIG.spec.className}.`;
    }

    this.active = false;
  }
}

export default VerifySpec;
