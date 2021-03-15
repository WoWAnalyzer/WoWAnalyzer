import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeginCastEvent, CastEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import Haste from 'parser/shared/modules/Haste';

import { MIN_GCD } from '@wowanalyzer/hunter';

class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    ...CoreGlobalCooldown.dependencies,
    haste: Haste,
  };

  protected haste!: Haste;

  aimedShotTimestamp: number | null = null;

  /**
   * Barrage and Rapid FIre GCDs are triggered when fabricating channel events
   */
  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.begincast.by(SELECTED_PLAYER).spell(SPELLS.AIMED_SHOT),
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
    if (spellId === SPELLS.BARRAGE_TALENT.id || spellId === SPELLS.RAPID_FIRE.id) {
      return;
    }
    const isOnGCD = this.isOnGlobalCooldown(spellId);
    if (!isOnGCD) {
      return;
    }
    super.onCast(event);
  }

  getGlobalCooldownDuration(spellId: number) {
    let gcd = super.getGlobalCooldownDuration(spellId);
    if (!gcd) {
      return 0;
    }
    if (spellId === SPELLS.AIMED_SHOT.id && this.aimedShotTimestamp === null) {
      return 0;
    }
    if (spellId === SPELLS.WILD_SPIRITS.id) {
      gcd = gcd / (1 + this.haste.current);
    }
    return Math.max(MIN_GCD, gcd);
  }
}

export default GlobalCooldown;
