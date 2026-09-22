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

export const MASSACRE_EXECUTE_THRESHOLD = 0.35;
export const DEFAULT_EXECUTE_THRESHOLD = 0.2;

export const apl = (info: PlayerInfo): Apl => {
  const rampageRageThreshold = 1000;
  // threshold below which builders are still better than spending (100 rage)
  // in the future this will probably be based on talents

  const apexRampageRageReduction =
    info.combatant.getTalentRank(TALENTS.RAMPAGING_BERSERKER_2_FURY_TALENT) * 150;
  // fury apex reduces rampage rage cost by 15 rage per rank

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
  const rampageUsable = {
    ...cnd.or(
      cnd.and(
        cnd.buffPresent(SPELLS.RECKLESSNESS),
        cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: 800 - apexRampageRageReduction }),
      ),
      cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: 800 }),
    ),
    describe: () => (
      <>
        <SpellLink spell={SPELLS.RAMPAGE} /> was usable
      </>
    ),
  };

  return info.combatant.hasTalent(TALENTS.SLAYERS_DOMINANCE_TALENT)
    ? buildSlayerApl(
        rampageUsable,
        executeUsable,
        executeSpell,
        rampageRageThreshold,
        apexRampageRageReduction,
      )
    : buildThaneApl(
        rampageUsable,
        executeUsable,
        executeSpell,
        rampageRageThreshold,
        apexRampageRageReduction,
      );
};

export const buildSlayerApl = (
  rampageUsable: Condition<boolean>,
  executeUsable: Condition<boolean>,
  executeSpell: Spell,
  rampageRageThreshold: number,
  apexRampageRageReduction: number,
): Apl => {
  return build([
    // Enrage
    {
      spell: SPELLS.RAMPAGE,
      condition: cnd.and(rampageUsable, cnd.buffMissing(SPELLS.ENRAGE)),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAMPAGE} /> to apply <SpellLink spell={SPELLS.ENRAGE} /> if
          it is missing
        </>
      ),
    },

    // high rage rampage during reck
    {
      spell: SPELLS.RAMPAGE,
      condition: {
        ...cnd.and(
          cnd.buffPresent(SPELLS.RECKLESSNESS),
          rampageUsable,
          cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: rampageRageThreshold }),
        ),
        describe: () => (
          <>
            above {rampageRageThreshold / 10} rage during <SpellLink spell={SPELLS.RECKLESSNESS} />
          </>
        ),
      },
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAMPAGE} /> above {rampageRageThreshold / 10} rage during{' '}
          <SpellLink spell={SPELLS.RECKLESSNESS} />
        </>
      ),
    },

    // rampage during reck before BS
    {
      spell: SPELLS.RAMPAGE,
      condition: {
        ...cnd.and(
          cnd.buffPresent(SPELLS.RECKLESSNESS),
          rampageUsable,
          cnd.spellAvailable(SPELLS.BLADESTORM),
        ),
        describe: () => (
          <>
            during <SpellLink spell={SPELLS.RECKLESSNESS} /> before{' '}
            <SpellLink spell={SPELLS.BLADESTORM} />
          </>
        ),
      },
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAMPAGE} /> during <SpellLink spell={SPELLS.RECKLESSNESS} />{' '}
          before <SpellLink spell={SPELLS.BLADESTORM} />
        </>
      ),
    },

    // Exe with SD during reck
    {
      spell: executeSpell,
      condition: cnd.and(
        cnd.buffPresent(SPELLS.RECKLESSNESS),
        cnd.buffPresent(SPELLS.SUDDEN_DEATH_TALENT_BUFF),
      ),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} /> during <SpellLink spell={SPELLS.RECKLESSNESS} />{' '}
          with <SpellLink spell={SPELLS.SUDDEN_DEATH_TALENT_BUFF} />
        </>
      ),
    },

    // rampage during reck without HnS
    {
      spell: SPELLS.RAMPAGE,
      condition: cnd.and(
        cnd.buffPresent(SPELLS.RECKLESSNESS),
        rampageUsable,
        cnd.buffMissing(SPELLS.HACK_AND_SLASH),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAMPAGE} /> during <SpellLink spell={SPELLS.RECKLESSNESS} />{' '}
          if <SpellLink spell={SPELLS.HACK_AND_SLASH} /> is missing
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
          Cast <SpellLink spell={SPELLS.CRUSHING_BLOW} />
        </>
      ),
    },

    // Exe  during reck
    {
      spell: executeSpell,
      condition: cnd.and(executeUsable, cnd.buffPresent(SPELLS.RECKLESSNESS)),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} /> during <SpellLink spell={SPELLS.RECKLESSNESS} />
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
          Cast <SpellLink spell={SPELLS.BLOODBATH} />
        </>
      ),
    },

    // high rage ramp
    {
      spell: SPELLS.RAMPAGE,
      condition: {
        ...cnd.and(
          cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: rampageRageThreshold }),
          rampageUsable,
        ),
        describe: () => <>above {rampageRageThreshold / 10} rage</>,
      },
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAMPAGE} /> above {rampageRageThreshold / 10} rage
        </>
      ),
    },

    // Exe
    {
      spell: executeSpell,
      condition: executeUsable,
      description: (
        <>
          Cast <SpellLink spell={executeSpell} />
        </>
      ),
    },

    // RB below rage threshold
    {
      spell: SPELLS.RAGING_BLOW,
      condition: cnd.spellAvailable(SPELLS.RAGING_BLOW),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAGING_BLOW} />
        </>
      ),
    },

    // fallback rampage
    {
      spell: SPELLS.RAMPAGE,
      condition: rampageUsable,
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAMPAGE} />
        </>
      ),
    },

    // BT below rage threshold
    {
      spell: SPELLS.BLOODTHIRST,
      condition: cnd.spellAvailable(SPELLS.BLOODTHIRST),

      description: (
        <>
          Cast <SpellLink spell={SPELLS.BLOODTHIRST} />
        </>
      ),
    },
  ]);
};

export const buildThaneApl = (
  rampageUsable: Condition<boolean>,
  executeUsable: Condition<boolean>,
  executeSpell: Spell,
  rampageRageThreshold: number,
  apexRampageRageReduction: number,
): Apl => {
  return build([
    // Enrage or high rage ramp
    {
      spell: SPELLS.RAMPAGE,
      condition: {
        ...cnd.and(
          rampageUsable,
          cnd.or(
            cnd.buffMissing(SPELLS.ENRAGE),
            cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: rampageRageThreshold }),
          ),
        ),
        describe: () => (
          <>
            <SpellLink spell={SPELLS.ENRAGE} /> was missing, or above {rampageRageThreshold / 10}{' '}
            rage during <SpellLink spell={SPELLS.RECKLESSNESS} />
          </>
        ),
      },
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAMPAGE} /> above {rampageRageThreshold / 10} rage, or to
          apply <SpellLink spell={SPELLS.ENRAGE} /> if it is missing
        </>
      ),
    },

    // BB to stack tier
    // there is no buff in the logs for the tier :)
    // so just made this an optional rule
    {
      spell: SPELLS.BLOODBATH,
      condition: cnd.optionalRule(
        cnd.and(cnd.spellAvailable(SPELLS.BLOODTHIRST), cnd.buffPresent(SPELLS.RECKLESSNESS)),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.BLOODBATH} /> to stack 12.1 tier set - there is no logged
          buff for this, so just use your brain to track it
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
          Cast <SpellLink spell={SPELLS.THUNDER_BLAST} /> with 2 stacks
        </>
      ),
    },

    // CB with HnS
    {
      spell: SPELLS.CRUSHING_BLOW,
      condition: cnd.and(
        cnd.spellAvailable(SPELLS.RAGING_BLOW),
        cnd.buffPresent(SPELLS.RECKLESSNESS),
        cnd.buffPresent(SPELLS.HACK_AND_SLASH),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.CRUSHING_BLOW} /> with{' '}
          <SpellLink spell={SPELLS.HACK_AND_SLASH} />
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
          Cast <SpellLink spell={SPELLS.BLOODBATH} />
        </>
      ),
    },

    // rampage during reck
    {
      spell: SPELLS.RAMPAGE,
      condition: cnd.and(cnd.buffPresent(SPELLS.RECKLESSNESS), rampageUsable),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAMPAGE} /> during <SpellLink spell={SPELLS.RECKLESSNESS} />
        </>
      ),
    },

    // thunder blast during ava
    {
      spell: SPELLS.THUNDER_CLAP, // seems like the cast is tied to TC but can still check for the TB buff
      condition: cnd.and(
        cnd.buffPresent(SPELLS.THUNDER_BLAST_BUFF),
        cnd.buffPresent(SPELLS.AVATAR_SHARED),
        cnd.spellAvailable(SPELLS.THUNDER_CLAP),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.THUNDER_BLAST} /> during{' '}
          <SpellLink spell={SPELLS.AVATAR_SHARED} />
        </>
      ),
    },

    // CB
    {
      spell: SPELLS.CRUSHING_BLOW,
      condition: cnd.and(
        cnd.spellAvailable(SPELLS.RAGING_BLOW),
        cnd.buffPresent(SPELLS.RECKLESSNESS),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.CRUSHING_BLOW} />
        </>
      ),
    },

    // RB with HnS
    {
      spell: SPELLS.CRUSHING_BLOW,
      condition: cnd.and(
        cnd.spellAvailable(SPELLS.RAGING_BLOW),
        cnd.buffPresent(SPELLS.HACK_AND_SLASH),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAGING_BLOW} /> with{' '}
          <SpellLink spell={SPELLS.HACK_AND_SLASH} />
        </>
      ),
    },

    // thunder blast
    {
      spell: SPELLS.THUNDER_CLAP, // seems like the cast is tied to TC but can still check for the TB buff
      condition: cnd.and(
        cnd.buffPresent(SPELLS.THUNDER_BLAST_BUFF),
        cnd.spellAvailable(SPELLS.THUNDER_CLAP),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.THUNDER_BLAST} />
        </>
      ),
    },

    // fallback rampage
    {
      spell: SPELLS.RAMPAGE,
      condition: rampageUsable,
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAMPAGE} />
        </>
      ),
    },

    // BT below rage threshold
    {
      spell: SPELLS.BLOODTHIRST,
      condition: cnd.spellAvailable(SPELLS.BLOODTHIRST),

      description: (
        <>
          Cast <SpellLink spell={SPELLS.BLOODTHIRST} />
        </>
      ),
    },

    // Exe conditions
    {
      spell: executeSpell,
      condition: executeUsable,
      description: (
        <>
          Cast <SpellLink spell={executeSpell} />
        </>
      ),
    },

    // RB
    {
      spell: SPELLS.CRUSHING_BLOW,
      condition: cnd.and(cnd.spellAvailable(SPELLS.RAGING_BLOW)),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.RAGING_BLOW} />
        </>
      ),
    },

    // TC
    {
      spell: SPELLS.THUNDER_CLAP,
      condition: cnd.spellAvailable(SPELLS.THUNDER_CLAP),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.THUNDER_CLAP} />
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
