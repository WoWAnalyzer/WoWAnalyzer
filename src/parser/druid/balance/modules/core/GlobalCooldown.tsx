import SPELLS from 'common/SPELLS';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

const STARLORD_MULTIPLIER = 0.85;
const NEW_MOON_MULTIPLIER = 2 / 3;

/**
 * The talent Starlord reduces GCD and cast time of empowered Lunar Strikes and Solar Wraths by 20%.
 * Since Solar Wrath cast time == GCD the GCD needs to be reduced.
 */
class GlobalCooldown extends CoreGlobalCooldown {
  getGlobalCooldownDuration(spellId: number) {
    const gcd = super.getGlobalCooldownDuration(spellId);
    if ((spellId === SPELLS.SOLAR_WRATH_MOONKIN.id && this.selectedCombatant.hasBuff(SPELLS.SOLAR_EMP_BUFF.id))
      || (spellId === SPELLS.LUNAR_STRIKE.id && this.selectedCombatant.hasBuff(SPELLS.LUNAR_EMP_BUFF.id))) {
      return Math.max(gcd * STARLORD_MULTIPLIER, 750);
    }
    if (spellId === SPELLS.NEW_MOON_TALENT.id) {
      return Math.max(gcd * NEW_MOON_MULTIPLIER, 750); // New Moon GCD is 1s reduced by haste but Half Moon and Full Moon are both 1.5s
    }
    return gcd;
  }
}

export default GlobalCooldown;
