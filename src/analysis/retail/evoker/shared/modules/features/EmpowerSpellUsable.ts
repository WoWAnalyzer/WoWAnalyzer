import { CastEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import EmpowerNormalizer, { empowerFinishedCasting } from '../normalizers/EmpowerNormalizer';
import { EMPOWERS } from '../../constants';

/** Empowers go on cooldown from the moment you start channeling them,
 * but if you cancel the cast the cooldown obviously resets/doesn't actually invoke.
 *
 * This module aims to resolve that interaction, by not invoking the cooldown on canceled casts. */
class EmpowerSpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    // We need isEmpowerActualCast castLink - so make sure the castLinks are made first
    empowerNormalizer: EmpowerNormalizer,
  };

  beginCooldown(cooldownTriggerEvent: CastEvent, spellId: number) {
    // Empower never finished casting so we don't set it on cooldown
    if (
      EMPOWERS.includes(cooldownTriggerEvent.ability.guid) &&
      !empowerFinishedCasting(cooldownTriggerEvent)
    ) {
      return;
    }

    super.beginCooldown(cooldownTriggerEvent, spellId);
  }
}

export default EmpowerSpellUsable;
