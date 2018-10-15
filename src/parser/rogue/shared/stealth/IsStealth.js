import SPELLS from 'common/SPELLS';

const STEALTH_BUFFS = [
  SPELLS.STEALTH,
  SPELLS.VANISH_BUFF,
];
const STEALTH_DANCE_BUFFS = [
  ...STEALTH_BUFFS,
  SPELLS.SHADOW_DANCE,
];

function isStealth(combatant, delayWindow){
  return STEALTH_BUFFS.some(s=>combatant.hasBuff(s.id, null , delayWindow));        
}

function isStealthOrDance(combatant, delayWindow){
  return STEALTH_DANCE_BUFFS.some(s=>combatant.hasBuff(s.id, null , delayWindow));        
}

export {isStealth, isStealthOrDance};
