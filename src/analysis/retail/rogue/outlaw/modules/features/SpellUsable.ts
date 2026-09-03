import Events, { ResourceChangeEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import { TALENTS_ROGUE } from 'common/TALENTS/rogue';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

// Ace up your Sleeve and Gravedigger reset Between the Eyes when they proc. Both surface as
// resource change events rather than cooldown events, so the reset has to be applied by hand.
class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.bteReset);
  }

  private bteReset(event: ResourceChangeEvent) {
    if (!this.selectedCombatant.hasTalent(TALENTS_ROGUE.ACE_UP_YOUR_SLEEVE_TALENT)) {
      return;
    }

    if (
      event.ability.guid == TALENTS_ROGUE.ACE_UP_YOUR_SLEEVE_TALENT.id ||
      event.ability.guid == TALENTS_ROGUE.GRAVEDIGGER_3_OUTLAW_TALENT.id
    ) {
      super.endCooldown(SPELLS.BETWEEN_THE_EYES.id, event.timestamp);
    }
  }
}

export default SpellUsable;
