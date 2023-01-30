import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import HIT_TYPES from 'game/HIT_TYPES';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

/**
 *
Your Frost Strike, Frostscythe, and Obliterate critical strikes reduce the remaining cooldown of Pillar of Frost by 4 sec.
 */
const ICECAP_COOLDOWN_REDUCTION_MS = 2000;
const ICECAP_INTERNAL_CD_MS = 500;

const ICECAP_ABILITIES = [
  SPELLS.OBLITERATE_MAIN_HAND_DAMAGE,
  SPELLS.OBLITERATE_OFF_HAND_DAMAGE,
  SPELLS.FROST_STRIKE_MAIN_HAND_DAMAGE,
  SPELLS.FROST_STRIKE_OFF_HAND_DAMAGE,
  talents.FROSTSCYTHE_TALENT,
];

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  lastCritTime: number = -2000;
  hasIcecap: boolean;

  constructor(options: Options) {
    super(options);
    this.hasIcecap = this.selectedCombatant.hasTalent(talents.ICECAP_TALENT);
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

    const offInternalCD = this.lastCritTime + ICECAP_INTERNAL_CD_MS <= event.timestamp;
    if (this.isOnCooldown(talents.PILLAR_OF_FROST_TALENT.id) && offInternalCD) {
      this.reduceCooldown(talents.PILLAR_OF_FROST_TALENT.id, ICECAP_COOLDOWN_REDUCTION_MS);
      this.lastCritTime = event.timestamp;
    }
  }
}

export default SpellUsable;
