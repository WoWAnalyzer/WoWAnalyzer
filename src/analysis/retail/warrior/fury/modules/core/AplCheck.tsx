import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/warrior';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellLink from 'interface/SpellLink';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, {
  Apl,
  build,
  CheckResult,
  Condition,
  PlayerInfo,
} from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';

const SUDDEN_DEATH_DURATION = 12000;
export const MASSACRE_EXECUTE_THRESHOLD = 0.35;
export const DEFAULT_EXECUTE_THRESHOLD = 0.2;

export const apl = (info: PlayerInfo): Apl => {
  const executeThreshold = info.combatant.hasTalent(TALENTS.MASSACRE_FURY_TALENT)
    ? MASSACRE_EXECUTE_THRESHOLD
    : DEFAULT_EXECUTE_THRESHOLD;
  const executeUsable = cnd.or(
    cnd.buffPresent(SPELLS.SUDDEN_DEATH_TALENT_BUFF),
    cnd.inExecute(executeThreshold),
  );
  const executeSpell = info.combatant.hasTalent(TALENTS.MASSACRE_FURY_TALENT)
    ? SPELLS.EXECUTE_FURY_MASSACRE
    : SPELLS.EXECUTE_FURY;

  const rampageRageThreshold = 1150;
  // threshold below which builders are still better than spending (115 rage)
  // in the future this will probably be based on talents

  return info.combatant.hasTalent(TALENTS.SLAYERS_DOMINANCE_TALENT)
    ? buildSlayerApl(executeThreshold, executeUsable, executeSpell, rampageRageThreshold)
    : buildThaneApl(executeThreshold, executeUsable, executeSpell, rampageRageThreshold);
};

export const buildSlayerApl = (
  executeThreshold: number,
  executeUsable: Condition<boolean>,
  executeSpell: Spell,
  rampageRageThreshold: number,
): Apl => {
  return build([
    // Enrage
    {
      spell: SPELLS.RAMPAGE,
      condition: cnd.and(
        cnd.buffMissing(SPELLS.ENRAGE),
        cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: 800 }),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAMPAGE} /> to apply <SpellLink spell={SPELLS.ENRAGE} /> if
          it is missing.
        </>
      ),
    },

    // Exe conditions
    {
      spell: executeSpell,
      condition: cnd.and(
        executeUsable,
        cnd.or(
          cnd.buffRemaining(SPELLS.SUDDEN_DEATH_TALENT_BUFF, SUDDEN_DEATH_DURATION, {
            atMost: 3000,
          }),
          cnd.buffStacks(SPELLS.SUDDEN_DEATH_TALENT_BUFF, { atLeast: 2, atMost: 2 }),
        ),
      ),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} /> when any of the following conditions are met:
          <ul>
            <li>
              Your <SpellLink spell={SPELLS.SUDDEN_DEATH_TALENT_BUFF} /> is about to expire
            </li>
            <li>
              You have 2 stacks of <SpellLink spell={SPELLS.SUDDEN_DEATH_TALENT_BUFF} />
            </li>
          </ul>
        </>
      ),
    },

    // CB regardless of rage
    {
      spell: SPELLS.CRUSHING_BLOW,
      condition: cnd.and(
        cnd.spellAvailable(SPELLS.RAGING_BLOW),
        cnd.buffPresent(SPELLS.RECKLESSNESS),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.CRUSHING_BLOW} />.
        </>
      ),
    },

    // BB regardless of rage
    {
      spell: SPELLS.BLOODBATH,
      condition: cnd.and(
        cnd.spellAvailable(SPELLS.BLOODTHIRST),
        cnd.buffPresent(SPELLS.RECKLESSNESS),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.BLOODBATH} />.
        </>
      ),
    },

    // high rage rampage
    {
      spell: SPELLS.RAMPAGE,
      condition: cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: rampageRageThreshold }),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAMPAGE} /> above {rampageRageThreshold / 10} rage to avoid
          overcapping.
        </>
      ),
    },

    // exe filler
    {
      spell: executeSpell,
      condition: executeUsable,
      description: (
        <>
          Cast <SpellLink spell={executeSpell} />.
        </>
      ),
    },

    // RB below rage threshold
    {
      spell: SPELLS.RAGING_BLOW,
      condition: cnd.spellAvailable(SPELLS.RAGING_BLOW),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAGING_BLOW} />.
        </>
      ),
    },

    // BT below rage threshold
    {
      spell: SPELLS.BLOODTHIRST,
      condition: cnd.spellAvailable(SPELLS.BLOODTHIRST),

      description: (
        <>
          Cast <SpellLink spell={SPELLS.BLOODTHIRST} />.
        </>
      ),
    },

    // fallback rampage
    {
      spell: SPELLS.RAMPAGE,
      condition: cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: 800 }),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAMPAGE} />.
        </>
      ),
    },

    // BT filler
    {
      spell: SPELLS.BLOODTHIRST,
      condition: executeUsable,
      description: (
        <>
          Cast <SpellLink spell={executeSpell} />.
        </>
      ),
    },

    // RB filler
    {
      spell: SPELLS.RAGING_BLOW,
      condition: executeUsable,
      description: (
        <>
          Cast <SpellLink spell={executeSpell} />.
        </>
      ),
    },
  ]);
};

export const buildThaneApl = (
  executeThreshold: number,
  executeUsable: Condition<boolean>,
  executeSpell: Spell,
  rampageRageThreshold: number,
): Apl => {
  return build([
    // Enrage
    {
      spell: SPELLS.RAMPAGE,
      condition: cnd.and(
        cnd.buffMissing(SPELLS.ENRAGE),
        cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: 800 }),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAMPAGE} /> to apply <SpellLink spell={SPELLS.ENRAGE} /> if
          it is missing.
        </>
      ),
    },

    // high rage rampage
    {
      spell: SPELLS.RAMPAGE,
      condition: cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: rampageRageThreshold }),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAMPAGE} /> above {rampageRageThreshold / 10} rage to avoid
          overcapping.
        </>
      ),
    },

    // 2 stack thunder blast
    {
      spell: SPELLS.THUNDER_CLAP, // seems like the cast is tied to TC but can still check for the TB buff
      condition: cnd.and(
        cnd.buffStacks(SPELLS.THUNDER_BLAST_BUFF, { atLeast: 2 }),
        cnd.spellAvailable(SPELLS.THUNDER_CLAP),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.THUNDER_BLAST} /> with 2 stacks.
        </>
      ),
    },

    // BB regardless of rage
    {
      spell: SPELLS.BLOODBATH,
      condition: cnd.and(
        cnd.spellAvailable(SPELLS.BLOODTHIRST),
        cnd.buffPresent(SPELLS.RECKLESSNESS),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.BLOODBATH} />.
        </>
      ),
    },

    // CB regardless of rage
    {
      spell: SPELLS.CRUSHING_BLOW,
      condition: cnd.and(
        cnd.spellAvailable(SPELLS.RAGING_BLOW),
        cnd.buffPresent(SPELLS.RECKLESSNESS),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.CRUSHING_BLOW} />.
        </>
      ),
    },

    // Exe conditions
    {
      spell: executeSpell,
      condition: cnd.and(executeUsable, cnd.hasTalent(TALENTS.DEEP_WOUNDS_TALENT)),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} /> if specced into its respective talents.
        </>
      ),
    },

    // BT below rage threshold
    {
      spell: SPELLS.BLOODTHIRST,
      condition: cnd.spellAvailable(SPELLS.BLOODTHIRST),

      description: (
        <>
          Cast <SpellLink spell={SPELLS.BLOODTHIRST} />.
        </>
      ),
    },

    // 1 stack thunder blast
    {
      spell: SPELLS.THUNDER_CLAP, // seems like the cast is tied to TC but can still check for the TB buff
      condition: cnd.and(
        cnd.buffPresent(SPELLS.THUNDER_BLAST_BUFF),
        cnd.spellAvailable(SPELLS.THUNDER_CLAP),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.THUNDER_BLAST} />.
        </>
      ),
    },

    // fallback rampage
    {
      spell: SPELLS.RAMPAGE,
      condition: cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: 800 }),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAMPAGE} />.
        </>
      ),
    },

    // RB below rage threshold
    {
      spell: SPELLS.RAGING_BLOW,
      condition: cnd.spellAvailable(SPELLS.RAGING_BLOW),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAGING_BLOW} />.
        </>
      ),
    },

    // exe filler
    {
      spell: executeSpell,
      condition: executeUsable,
      description: (
        <>
          Cast <SpellLink spell={executeSpell} />.
        </>
      ),
    },

    // RB filler
    {
      spell: SPELLS.RAGING_BLOW,
      condition: executeUsable,
      description: (
        <>
          Cast <SpellLink spell={executeSpell} />.
        </>
      ),
    },
  ]);
};

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl(info));
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});
