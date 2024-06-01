import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceLink from 'interface/ResourceLink';
import SpellLink from 'interface/SpellLink';
import { TooltipElement } from 'interface/Tooltip';
import { suggestion } from 'parser/core/Analyzer';
import { EventType, GetRelatedEvent } from 'parser/core/Events';
import aplCheck, { Condition, build, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import { DEATH_STRIKE_HEAL } from '../spells/DeathStrike/normalizer';

const boneShieldLow = (maxStacks: number) =>
  cnd.or(
    cnd.buffMissing(SPELLS.BONE_SHIELD, {
      timeRemaining: 4500,
      duration: 30000,
      pandemicCap: 1,
    }),
    cnd.buffStacks(SPELLS.BONE_SHIELD, { atMost: maxStacks }),
  );

const ossuaryCnd = cnd.describe(
  cnd.and(boneShieldLow(4), cnd.buffMissing(SPELLS.DANCING_RUNE_WEAPON_TALENT_BUFF)),
  (tense) => (
    <>
      <SpellLink spell={talents.OSSUARY_TALENT} /> {tenseAlt(tense, 'is', 'was')} inactive
    </>
  ),
);

export const runeRules = {
  marrowrend: {
    spell: talents.MARROWREND_TALENT,
    condition: ossuaryCnd,
  },
  soulReaper: {
    spell: talents.SOUL_REAPER_TALENT,
    condition: cnd.inExecute(0.35), // this should really get a custom condition for the case where you cast soul reaper and then it explodes below 35%, but that can only happen 1 time per target
  },
  deathsCaress: {
    spell: talents.DEATHS_CARESS_TALENT,
    condition: cnd.optionalRule(ossuaryCnd), // allow optionally using DC for BS refresh. i'm not here to litigate optimality. some high end people use DC for it a ton
  },
  drw: {
    soulReaper: {
      spell: talents.SOUL_REAPER_TALENT,
      condition: cnd.and(
        cnd.buffPresent(SPELLS.DANCING_RUNE_WEAPON_TALENT_BUFF),
        cnd.inExecute(0.35),
      ),
    },
    marrowrend: {
      // the guide includes this. it isn't strictly optimal under certain settings but we allow it
      spell: talents.MARROWREND_TALENT,
      condition: cnd.describe(
        cnd.optionalRule(
          cnd.and(
            cnd.buffPresent(SPELLS.DANCING_RUNE_WEAPON_TALENT_BUFF),
            // cheating with DRW duration because EVERYONE uses the same core talents
            cnd.buffRemaining(SPELLS.DANCING_RUNE_WEAPON_TALENT_BUFF, 16000, { atMost: 4500 }),
            // this condition prevents spamming it from passing muster
            cnd.buffRemaining(SPELLS.BONE_SHIELD, 30000, { atMost: 27000 }),
          ),
        ),
        (tense) => (
          <>
            <SpellLink spell={talents.DANCING_RUNE_WEAPON_TALENT} /> {tenseAlt(tense, 'is', 'was')}{' '}
            about to end to refresh <SpellLink spell={SPELLS.BONE_SHIELD} /> to max stacks
          </>
        ),
      ),
    },

    marrowrendMissing: {
      spell: talents.MARROWREND_TALENT,
      condition: cnd.describe(
        cnd.and(cnd.buffPresent(SPELLS.DANCING_RUNE_WEAPON_TALENT_BUFF), boneShieldLow(1)),
        () => (
          <>
            <SpellLink spell={SPELLS.BONE_SHIELD} /> is at 0 or 1 stacks during{' '}
            <SpellLink spell={talents.DANCING_RUNE_WEAPON_TALENT} />
          </>
        ),
      ),
    },
  },
};

const deathAndDecay = {
  spell: SPELLS.DEATH_AND_DECAY,
  condition: cnd.optionalRule(
    cnd.buffMissing(SPELLS.DEATH_AND_DECAY_BUFF, {
      pandemicCap: 1,
      duration: 10,
      timeRemaining: 3,
    }),
  ),
};

const defensiveUseCondition: Condition<null> = {
  key: 'ds-defensive-use',
  init: () => null,
  update: () => null,
  validate: (_state, event) => {
    if (event.ability.guid !== talents.DEATH_STRIKE_TALENT.id) {
      return false;
    }

    const heal = GetRelatedEvent(event, DEATH_STRIKE_HEAL);

    if (heal?.type === EventType.Heal) {
      return heal.amount / heal.maxHitPoints >= 0.25;
    } else {
      return false;
    }
  },
  describe: () => <></>,
};

export const apl = build([
  {
    spell: talents.DEATH_STRIKE_TALENT,
    condition: cnd.describe(defensiveUseCondition, (tense) => (
      <>you {tenseAlt(tense, 'need', 'needed')} to defensively</>
    )),
  },
  runeRules.drw.marrowrend,
  deathAndDecay,
  runeRules.drw.soulReaper,
  runeRules.drw.marrowrendMissing,
  runeRules.deathsCaress,
  runeRules.marrowrend,
  runeRules.soulReaper,
  {
    spell: talents.DEATH_STRIKE_TALENT,
    // Runic Power is scaled up by 10x
    condition: cnd.describe(
      cnd.hasResource(RESOURCE_TYPES.RUNIC_POWER, { atLeast: 1000 }, 0),
      (tense) => (
        <>
          you {tenseAlt(tense, 'have', 'had')} 100+{' '}
          <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} /> to prevent capping
        </>
      ),
    ),
  },
  {
    spell: talents.HEART_STRIKE_TALENT,
    condition: cnd.describe(cnd.hasResource(RESOURCE_TYPES.RUNES, { atLeast: 4 }, 6), (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} fewer than 3{' '}
        <ResourceLink id={RESOURCE_TYPES.RUNES.id} /> on cooldown
      </>
    )),
  },
  [talents.DEATH_STRIKE_TALENT, talents.HEART_STRIKE_TALENT, talents.BLOOD_BOIL_TALENT],
]);

export const check = aplCheck(apl);

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);
  return undefined;
});

export const AplSummary = () => (
  <>
    <p>
      <strong>
        During <SpellLink spell={talents.DANCING_RUNE_WEAPON_TALENT} />
      </strong>
      <ol>
        <li>
          Use <SpellLink spell={talents.MARROWREND_TALENT} /> to refresh{' '}
          <SpellLink spell={SPELLS.BONE_SHIELD} /> at the end of{' '}
          <SpellLink spell={talents.DANCING_RUNE_WEAPON_TALENT}>DRW</SpellLink> (
          <TooltipElement
            content={
              <>
                <p>
                  With the cooldown reduction from{' '}
                  <SpellLink spell={talents.INSATIABLE_BLADE_TALENT} />, the math works out that
                  ending <SpellLink spell={talents.DANCING_RUNE_WEAPON_TALENT}>DRW</SpellLink> with
                  10 stacks of <SpellLink spell={SPELLS.BONE_SHIELD} /> allows you to cast only a
                  single <SpellLink spell={talents.MARROWREND_TALENT} /> between uses of{' '}
                  <SpellLink spell={talents.DANCING_RUNE_WEAPON_TALENT}>DRW</SpellLink>.
                </p>
                <p>
                  <SpellLink spell={talents.MARROWREND_TALENT} /> is less efficient at converting{' '}
                  <ResourceLink id={RESOURCE_TYPES.RUNES.id} /> to{' '}
                  <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id}>RP</ResourceLink> than other
                  spells, so this leads to more{' '}
                  <SpellLink spell={talents.DEATH_STRIKE_TALENT}>Death Strikes</SpellLink>.
                </p>
              </>
            }
            hoverable
          >
            Why?
          </TooltipElement>
          )
        </li>
        <li>
          Put down <SpellLink spell={SPELLS.DEATH_AND_DECAY} /> if it has expired or you can't stand
          in your prevoius one
        </li>
        <li>
          Cast <SpellLink spell={talents.SOUL_REAPER_TALENT} /> if the explosion will happen below
          35% HP
        </li>
        <li>
          Use <SpellLink spell={talents.MARROWREND_TALENT} /> to apply{' '}
          <SpellLink spell={SPELLS.BONE_SHIELD} /> if it is missing
        </li>
        <li>
          Try not to let any of your resources cap:
          <ul>
            <li>
              <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} />, spent on{' '}
              <SpellLink spell={talents.DEATH_STRIKE_TALENT} />
            </li>
            <li>
              <ResourceLink id={RESOURCE_TYPES.RUNES.id} />, spent on{' '}
              <SpellLink spell={talents.HEART_STRIKE_TALENT} />
            </li>
            <li>
              <SpellLink spell={talents.BLOOD_BOIL_TALENT} /> charges
            </li>
          </ul>
        </li>
      </ol>
    </p>
    <p>
      <strong>
        Outside of <SpellLink spell={talents.DANCING_RUNE_WEAPON_TALENT} />
      </strong>

      <ol>
        <li>
          Put down <SpellLink spell={SPELLS.DEATH_AND_DECAY} /> if it has expired or you can't stand
          in your prevoius one
        </li>
        <li>
          Cast <SpellLink spell={talents.SOUL_REAPER_TALENT} /> if the explosion will happen below
          35% HP
        </li>
        <li>
          Use <SpellLink spell={talents.MARROWREND_TALENT} /> to maintain{' '}
          <SpellLink spell={SPELLS.BONE_SHIELD} /> at 5+ stacks to enable{' '}
          <SpellLink spell={talents.OSSUARY_TALENT} />
        </li>
        <li>
          Try not to let any of your resources cap:
          <ul>
            <li>
              <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} />, spent on{' '}
              <SpellLink spell={talents.DEATH_STRIKE_TALENT} />
            </li>
            <li>
              <ResourceLink id={RESOURCE_TYPES.RUNES.id} />, spent on{' '}
              <SpellLink spell={talents.HEART_STRIKE_TALENT} />
            </li>
            <li>
              <SpellLink spell={talents.BLOOD_BOIL_TALENT} /> charges
            </li>
          </ul>
        </li>
      </ol>
    </p>
  </>
);
