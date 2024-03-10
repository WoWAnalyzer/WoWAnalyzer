import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeginCastEvent, CastEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

class GlobalCooldown extends CoreGlobalCooldown {
  aimedShotTimestamp: number | null = null;

  /**
   * Barrage and Rapid Fire GCDs are triggered when fabricating channel events
   */
  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.begincast.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.AIMED_SHOT_TALENT),
      this.startAimedShot,
    );
  }

  startAimedShot(event: BeginCastEvent) {
    if (!event.__fabricated) {
      this.aimedShotTimestamp = event.timestamp;
    }
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === TALENTS_HUNTER.BARRAGE_TALENT.id || spellId === SPELLS.RAPID_FIRE.id) {
      return;
    }
    const isOnGCD = this.isOnGlobalCooldown(spellId);
    if (!isOnGCD) {
      return;
    }
    super.onCast(event);
  }

  getGlobalCooldownDuration(spellId: number) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    if (!gcd) {
      return 0;
    }
    if (spellId === TALENTS_HUNTER.AIMED_SHOT_TALENT.id && this.aimedShotTimestamp === null) {
      return 0;
    }
    return gcd;
  }
}

export default GlobalCooldown;
