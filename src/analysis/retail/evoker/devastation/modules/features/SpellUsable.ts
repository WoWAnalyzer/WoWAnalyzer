import { CastEvent } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/evoker';
import {
  DEEP_BREATH_SPELL_IDS,
  SpellUsable as SharedSpellUsable,
} from 'analysis/retail/evoker/shared';
import StrafingRunNormalizer, { getPrimaryDeepBreathEvent } from '../normalizers/StrafingRun';

class SpellUsable extends SharedSpellUsable.withDependencies({
  strafingRunNormalizer: StrafingRunNormalizer,
}) {
  hasStrafingRun = this.selectedCombatant.hasTalent(TALENTS.STRAFING_RUN_TALENT);

  beginCooldown(cooldownTriggerEvent: CastEvent, _spellId: number) {
    const spellId = cooldownTriggerEvent.ability.guid;

    if (DEEP_BREATH_SPELL_IDS.includes(spellId)) {
      return this.onDeepBreathCast(cooldownTriggerEvent, spellId);
    }

    super.beginCooldown(cooldownTriggerEvent, spellId);
  }

  /**
   * Strafing run allows Deep Breath to be cast again within 18s of being used.
   *
   * The cooldown starts on the first cast, which we need to maintain due to Wingleader talent,
   * otherwise we won't maintain proper CDR.
   *
   * To get semi-proper statistics, we still want to have the cooldown end and start on the second cast.
   */
  private onDeepBreathCast(event: CastEvent, spellId: number) {
    if (!this.hasStrafingRun) {
      return super.beginCooldown(event, spellId);
    }

    const primaryDBEvent = getPrimaryDeepBreathEvent(event);
    if (!primaryDBEvent || super.isAvailable(spellId)) {
      return super.beginCooldown(event, spellId);
    }

    const cooldownRemaining = super.cooldownRemaining(spellId);

    super.endCooldown(spellId);
    super.beginCooldown(event, spellId);

    const diff = Math.abs(cooldownRemaining - super.fullCooldownDuration(spellId));
    super.reduceCooldown(event.ability.guid, diff);
  }
}

export default SpellUsable;
