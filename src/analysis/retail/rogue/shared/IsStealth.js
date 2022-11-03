import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';

const STEALTH_BUFFS = [SPELLS.STEALTH, SPELLS.VANISH_BUFF];
const STEALTH_DANCE_BUFFS = [...STEALTH_BUFFS, TALENTS.SHADOW_DANCE_TALENT];

function isStealth(combatant, delayWindow) {
  return STEALTH_BUFFS.some((s) => combatant.hasBuff(s.id, null, delayWindow));
}

function isStealthOrDance(combatant, delayWindow) {
  return STEALTH_DANCE_BUFFS.some((s) => combatant.hasBuff(s.id, null, delayWindow));
}

export { isStealth, isStealthOrDance };
