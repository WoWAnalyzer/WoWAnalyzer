import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import HIT_TYPES from 'game/HIT_TYPES';
import Events, { DamageEvent } from 'parser/core/Events';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

/**
 *
Your Frost Strike, Frostscythe, and Obliterate critical strikes reduce the remaining cooldown of Pillar of Frost by 4 sec.
 */
const ICECAP_COOLDOWN_REDUCTION_MS = 4000;
const ICECAP_INTERNAL_CD = 1000;

const ICECAP_ABILITIES = [
  SPELLS.OBLITERATE_MAIN_HAND_DAMAGE,
  SPELLS.OBLITERATE_OFF_HAND_DAMAGE,
  SPELLS.FROST_STRIKE_MAIN_HAND_DAMAGE,
  SPELLS.FROST_STRIKE_OFF_HAND_DAMAGE,
  SPELLS.FROSTSCYTHE_TALENT
];

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  lastCritTime: number = -2000;
  hasIcecap: boolean;

  constructor(options: Options) {
    super(options);
    this.hasIcecap = this.selectedCombatant.hasTalent(SPELLS.ICECAP_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(ICECAP_ABILITIES), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    if (!this.hasIcecap) {
      return;
    }

    const isCrit = event.hitType === HIT_TYPES.CRIT || event.hitType === HIT_TYPES.BLOCKED_CRIT;
    if (!isCrit) {
      return;
    }

    const offInternalCD = (this.lastCritTime + ICECAP_INTERNAL_CD) <= event.timestamp;
      if (this.isOnCooldown(SPELLS.PILLAR_OF_FROST.id) && offInternalCD) {
        this.reduceCooldown(SPELLS.PILLAR_OF_FROST.id, ICECAP_COOLDOWN_REDUCTION_MS);
        this.lastCritTime = event.timestamp;
      }
  }
}

export default SpellUsable;
