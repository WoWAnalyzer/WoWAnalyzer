import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

import { Options } from 'parser/core/Module';
import { AbilityEvent } from 'parser/core/Events';
import { TALENTS_DRUID } from 'common/TALENTS';

const debug = false;

/**
 * Extension handles possibility of Tiger's Fury refresh w/ Predator talent.
 * Refresh is 'invisible', so this only suppresses the error when it happens.
 * TODO reactivate attempt to estimate refresh time using mob death estimation?
 */
class SpellUsable extends CoreSpellUsable {
  hasPredator: boolean;

  constructor(options: Options) {
    super(options);
    this.hasPredator = this.selectedCombatant.hasTalent(TALENTS_DRUID.PREDATOR_TALENT);
  }

  beginCooldown(triggerEvent: AbilityEvent<any>, spellId: number) {
    if (this.hasPredator && spellId === SPELLS.TIGERS_FURY.id) {
      this.endCooldown(spellId);
      debug &&
        console.log(
          "Predator - Tiger's Fury reset detected @ " +
            this.owner.formatTimestamp(this.owner.currentTimestamp),
        );
    }
    super.beginCooldown(triggerEvent, spellId);
  }
}

export default SpellUsable;
