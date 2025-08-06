import aplCheck, { build } from 'parser/shared/metrics/apl';
import SpellLink from 'interface/SpellLink';
import { tenseAlt } from 'parser/shared/metrics/apl';

import * as cnd from 'parser/shared/metrics/apl/conditions';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import TALENTS from 'common/TALENTS/mage';
import SPELLS from 'common/SPELLS';

// Wowhead APL for Arcane Mage, [between brackets changes or things not taken into account].

export const sunfuryApl = build([
  // 1. Arcane Missiles if you have 3x Clearcasting, [clip this off the GCD no matter what,
  // but always cast Arcane Barrage on the last GCD of Arcane Soul/Added the Arcane Soul
  // condition to match actual raidbots APL].
  {
    spell: TALENTS.ARCANE_MISSILES_TALENT,
    condition: cnd.and(
      cnd.buffStacks(SPELLS.CLEARCASTING_ARCANE, { atLeast: 3 }),
      cnd.buffMissing(SPELLS.NETHER_PRECISION_BUFF),
      cnd.buffPresent(SPELLS.ARCANE_SOUL_BUFF),
    ),
  },
  // 2. Arcane Barrage if you have Arcane Soul.
  {
    spell: SPELLS.ARCANE_BARRAGE,
    condition: cnd.buffPresent(SPELLS.ARCANE_SOUL_BUFF),
  },
  // 3. Arcane Barrage if Intuition or Arcane Tempo [will expire before your next cast completes/
  // will expire in less than 2 seconds].
  {
    spell: SPELLS.ARCANE_BARRAGE,
    condition: cnd.or(
      cnd.buffPresent(SPELLS.INTUITION_BUFF),
      cnd.buffRemaining(SPELLS.ARCANE_TEMPO_BUFF, 12000, { atMost: 1000 }),
    ),
  },

  // [Shifting Power after  Arcane Soul ends].
  // [Arcane Missiles with  Aether Attunement if Touch of the Magi is about to come off cooldown,
  // you should clip this off the GCD to enter  Touch of the Magi as quickly as possible.]
  // 4. [Arcane Barrage if Touch of the Magi is about to come off cooldown, this is not in WoWhead APL but
  // it is in the raidbots APL, so I added it here. Otherwise all barrage into touch were taken as bad casts.]
  {
    spell: SPELLS.ARCANE_BARRAGE,
    condition: cnd.or(
      cnd.spellCooldownRemaining(TALENTS.TOUCH_OF_THE_MAGI_TALENT, { atMost: 1000 }),
      cnd.spellAvailable(TALENTS.TOUCH_OF_THE_MAGI_TALENT),
    ),
  },

  // 5. Arcane Orb whenever you have less than 3x Arcane Charges.
  {
    spell: SPELLS.ARCANE_ORB,
    condition: cnd.hasResource(RESOURCE_TYPES.ARCANE_CHARGES, { atLeast: 0, atMost: 2 }),
  },

  // 6. Arcane Missiles with Clearcasting when you don't have Nether Precision,
  // [clip this off the GCD unless you have  Aether Attunement proc].
  {
    spell: TALENTS.ARCANE_MISSILES_TALENT,
    condition: cnd.and(
      cnd.buffPresent(SPELLS.CLEARCASTING_ARCANE),
      cnd.buffMissing(SPELLS.NETHER_PRECISION_BUFF),
    ),
  },

  // 7. Arcane Barrage if you have either Intuition or Glorious Incandescence,
  // [don't do this for  Glorious Incandescence if  Touch of the Magi is less than 6 seconds away/
  // Added the BoP condition to catch the cases when we queue a Barrage after BoP, then GI timespan is
  // almost 0 and it was been treated as a bad cast].
  {
    spell: SPELLS.ARCANE_BARRAGE,
    condition: cnd.describe(
      cnd.or(
        cnd.buffPresent(SPELLS.INTUITION_BUFF, 500),
        // cnd.buffPresent(SPELLS.GLORIOUS_INCANDESCENCE_BUFF, 500),
        cnd.buffPresent(SPELLS.GLORIOUS_INCANDESCENCE_BUFF, -200),
        cnd.buffPresent(SPELLS.BURDEN_OF_POWER_BUFF),
      ),
      (tense) => (
        <>
          <SpellLink spell={SPELLS.INTUITION_BUFF} /> or{' '}
          <SpellLink spell={SPELLS.GLORIOUS_INCANDESCENCE_BUFF} /> {tenseAlt(tense, 'is', 'was')}{' '}
          present
        </>
      ),
    ),
  },

  // 8. Arcane Explosion if you have less than 2 charges, yep.
  {
    spell: SPELLS.ARCANE_EXPLOSION,
    condition: cnd.hasResource(RESOURCE_TYPES.ARCANE_CHARGES, { atLeast: 0, atMost: 2 }),
  },

  // 9. Arcane Blast.
  {
    spell: SPELLS.ARCANE_BLAST,
    condition: cnd.hasResource(RESOURCE_TYPES.MANA, { atLeast: 10 }),
  },

  // 10. Arcane Barrage if you run out of mana.
  SPELLS.ARCANE_BARRAGE,
]);

export const sunfuryCheck = aplCheck(sunfuryApl);
