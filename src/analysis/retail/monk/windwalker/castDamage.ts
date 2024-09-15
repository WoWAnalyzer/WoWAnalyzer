import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { TALENTS_MONK } from 'common/TALENTS';

/**
 * Map of casted spells (that can appear when listening to casts) and their
 * associated damage (that can appear when listening to damage)
 *
 * CASTED ability on the left, DAMAGE spell on the right.
 *
 * This map only makes sense with 1-to-1 connections.
 */
export const castDamageMap: ReadonlyMap<Spell, Spell[]> = new Map([
  [SPELLS.FISTS_OF_FURY_CAST, [SPELLS.FISTS_OF_FURY_DAMAGE]],
  [TALENTS_MONK.WHIRLING_DRAGON_PUNCH_TALENT, [SPELLS.WHIRLING_DRAGON_PUNCH_DAMAGE]],
  [SPELLS.SPINNING_CRANE_KICK, [SPELLS.SPINNING_CRANE_KICK_DAMAGE]],
  [TALENTS_MONK.CHI_BURST_SHARED_TALENT, [SPELLS.CHI_BURST_TALENT_DAMAGE]],
  [TALENTS_MONK.CHI_WAVE_TALENT, [SPELLS.CHI_WAVE_TALENT_DAMAGE]],
  [TALENTS_MONK.RISING_SUN_KICK_TALENT, [SPELLS.RISING_SUN_KICK_DAMAGE]],
  [TALENTS_MONK.JADEFIRE_STOMP_TALENT, [SPELLS.FAELINE_STOMP_PULSE_DAMAGE]],
]);
