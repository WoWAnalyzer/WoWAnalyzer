import { CastEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import EmpowerNormalizer, { empowerFinishedCasting } from '../normalizers/EmpowerNormalizer';
import { EMPOWERS } from '../../constants';

/** Empowers go on cooldown from the moment you start channeling them,
 * but if you cancel the cast the cooldown resets/doesn't actually invoke.
 *
 * This module aims to resolve that interaction, by not invoking the cooldown for canceled casts. */
class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    // We need EMPOWERED_CAST castLink - so make sure the castLinks are made first
    empowerNormalizer: EmpowerNormalizer,
  };

  beginCooldown(cooldownTriggerEvent: CastEvent, _spellId: number) {
    const spellId = cooldownTriggerEvent.ability.guid;
    // Empower never finished casting so we don't set it on cooldown
    if (EMPOWERS.includes(spellId) && !empowerFinishedCasting(cooldownTriggerEvent)) {
      return;
    }

    super.beginCooldown(cooldownTriggerEvent, spellId);
  }
}

export default SpellUsable;
