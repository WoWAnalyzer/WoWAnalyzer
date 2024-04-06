import { EMPOWERS, EMPOWER_CANCELED_GCD, EMPOWER_MINIMUM_GCD } from '../..';
import { BeginChannelEvent, CastEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import { empowerFinishedCasting, isFromTipTheScales } from '../normalizers/EmpowerNormalizer';

/**
 * Empowers GCD functions slightly different than normal GCDs.
 * When you fully channel an empower you get a base GCD of 1500ms.
 * But if you cancel the channel you only invoke a reduced GCD ~750ms.
 * If the empower is instant cast with Tip The Scales, the GCD is reduced to 500ms.
 */
class GlobalCooldown extends CoreGlobalCooldown {
  currentEmpower: CastEvent | undefined = undefined;

  onCast(event: CastEvent) {
    if (EMPOWERS.includes(event.ability.guid)) {
      this.currentEmpower = event;
    }
    super.onCast(event);
  }

  /** Override to avoid triggering duplicate GCDs */
  onBeginChannel(event: BeginChannelEvent) {
    if (EMPOWERS.includes(event.ability.guid)) {
      // This GCD gets handled by the `onCast` event
      return;
    }
    super.onBeginChannel(event);
  }

  getGlobalCooldownDuration(spellId: number): number {
    const ability = this.abilities.getAbility(spellId);
    const curEmpower = this.currentEmpower;

    if (!ability || !curEmpower || curEmpower.ability.guid !== spellId) {
      return super.getGlobalCooldownDuration(spellId);
    }

    const gcd = this._resolveAbilityGcdField(ability.gcd);
    if (isFromTipTheScales(curEmpower)) {
      return this._resolveAbilityGcdField(gcd.minimum) ?? EMPOWER_MINIMUM_GCD;
    }
    if (!empowerFinishedCasting(curEmpower)) {
      return EMPOWER_CANCELED_GCD;
    }

    return super.getGlobalCooldownDuration(spellId);
  }
}

export default GlobalCooldown;
