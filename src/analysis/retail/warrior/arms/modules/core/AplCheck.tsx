import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { build } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';

export const apl = build([
  //Ashen Juggernaut
  {
    spell: SPELLS.EXECUTE,
    condition: cnd.and(
      cnd.buffMissing(SPELLS.ASHEN_JUGGERNAUT, {
        timeRemaining: 2400,
        duration: 8000,
      }),
      cnd.hasConduit(SPELLS.ASHEN_JUGGERNAUT),
    ),
  },
  //2 Overpower Charges
  {
    spell: SPELLS.OVERPOWER,
    condition: cnd.spellCharges(SPELLS.OVERPOWER, { atLeast: 2, atMost: 2 }),
  },
  //Mortal Strike Conditions:
  // Execute: Deep Wounds < 1 GCD || Enduring Blow || (2 Overpower Stacks && 2 Exploiter Stacks) || Battlelord Buff
  // Non-Execute: Enduring BLow || 2 Overpower Stacks || Battlelord
  { spell: SPELLS.MORTAL_STRIKE, condition: cnd.hasLegendary(SPELLS.ENDURING_BLOW) },
  {
    spell: SPELLS.MORTAL_STRIKE,
    condition: cnd.and(
      cnd.hasLegendary(SPELLS.BATTLELORD_ITEM),
      cnd.buffPresent(SPELLS.BATTLELORD),
    ),
  },
  {
    spell: SPELLS.MORTAL_STRIKE,
    condition: cnd.and(
      cnd.buffStacks(SPELLS.OVERPOWER, { atLeast: 2 }),
      cnd.buffStacks(SPELLS.EXPLOITER, { atLeast: 2 }),
      cnd.inExecute(),
    ),
  },
  {
    spell: SPELLS.MORTAL_STRIKE,
    condition: cnd.and(cnd.buffStacks(SPELLS.OVERPOWER, { atLeast: 2 }), cnd.not(cnd.inExecute())),
  },
  // Execute /w Sudden Death
  { spell: SPELLS.EXECUTE, condition: cnd.buffPresent(SPELLS.SUDDEN_DEATH_ARMS_TALENT_BUFF) },
  // Skull Splitter No Execute: <55 rage and no sudden death
  {
    spell: TALENTS.SKULLSPLITTER_TALENT,
    condition: cnd.and(
      cnd.hasResource(RESOURCE_TYPES.RAGE, { atMost: 55 }),
      //cnd.buffMissing(SPELLS.DEADLY_CALM_TALENT),
      cnd.not(cnd.inExecute()),
    ),
  },
  // Skull Splitter Execute: <45 rage
  {
    spell: TALENTS.SKULLSPLITTER_TALENT,
    condition: cnd.and(cnd.hasResource(RESOURCE_TYPES.RAGE, { atMost: 45 }), cnd.inExecute()),
  },
  SPELLS.OVERPOWER,
  SPELLS.MORTAL_STRIKE,
  { spell: SPELLS.WHIRLWIND, condition: cnd.hasTalent(TALENTS.FERVOR_OF_BATTLE_TALENT) },
  { spell: SPELLS.EXECUTE, condition: cnd.inExecute() },
  //not fervor + (rage > 50 / cs debuff / not eb lego)
  // this might be a bit much
  //SPELLS.SLAM,
  { spell: SPELLS.SLAM, condition: cnd.not(cnd.hasTalent(TALENTS.FERVOR_OF_BATTLE_TALENT)) },
  /* {
    spell: SPELLS.SLAM,
    condition: cnd.and(
      cnd.hasNoTalent(SPELLS.FERVOR_OF_BATTLE_TALENT),
      cnd.or(cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: 50 }), cnd.hasNoLegendary(SPELLS.ENDURING_BLOW)),
    ),
  }, */
]);

export const check = aplCheck(apl);

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});
