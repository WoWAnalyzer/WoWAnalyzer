import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import talents from 'common/TALENTS/monk';
import { AnyEvent, EventType } from 'parser/core/Events';
import { SpellLink } from 'interface';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AOE_SCK = {
  spell: SPELLS.SPINNING_CRANE_KICK,
  condition: cnd.and(
    cnd.targetsHit(
      { atLeast: 4 },
      {
        targetSpell: SPELLS.SPINNING_CRANE_KICK_DAMAGE,
      },
    ),
    cnd.hasTalent(talents.AWAKENED_FAELINE_TALENT),
  ),
};

const VIVIFY_10_REMS = {
  spell: SPELLS.VIVIFY,
  condition: cnd.targetsHit(
    { atLeast: 10 },
    {
      targetSpell: SPELLS.VIVIFY,
      targetType: EventType.Heal,
    },
  ),
};
const VIVIFY_6_REMS = {
  spell: SPELLS.VIVIFY,
  condition: cnd.targetsHit(
    { atLeast: 6 },
    {
      targetSpell: SPELLS.VIVIFY,
      targetType: EventType.Heal,
    },
  ),
};

const commonTop = [
  {
    spell: talents.RENEWING_MIST_TALENT,
    condition: cnd.describe(
      cnd.and(
        cnd.spellCharges(talents.RENEWING_MIST_TALENT, { atLeast: 2 }),
        cnd.spellAvailable(talents.RENEWING_MIST_TALENT),
      ),
      (tense) => <>you {tenseAlt(tense, 'have', 'had')} 2 charges</>,
    ),
  },
  talents.THUNDER_FOCUS_TEA_TALENT,
];

const commonBottom = [talents.CHI_WAVE_TALENT, SPELLS.EXPEL_HARM];
const atMissingCondition = cnd.buffMissing(talents.ANCIENT_TEACHINGS_TALENT, {
  duration: 15000,
  timeRemaining: 1500,
});

const rotation_rm_at = build([
  ...commonTop,
  talents.RISING_SUN_KICK_TALENT,
  VIVIFY_10_REMS,
  {
    spell: talents.ESSENCE_FONT_TALENT,
    condition: atMissingCondition,
  },
  VIVIFY_6_REMS,
  {
    spell: talents.FAELINE_STOMP_TALENT,
    condition: cnd.describe(
      cnd.and(
        cnd.hasTalent(talents.FAELINE_STOMP_TALENT),
        cnd.hasTalent(talents.UPWELLING_TALENT),
        cnd.spellCooldownRemaining(talents.ESSENCE_FONT_TALENT, { atLeast: 0.00001 }),
        atMissingCondition,
      ),
      (tense) => (
        <>
          <SpellLink id={talents.ESSENCE_FONT_TALENT} /> {tenseAlt(tense, 'is', 'was')} on cooldown
          and <SpellLink id={talents.ANCIENT_TEACHINGS_TALENT} /> is missing or about to expire.
        </>
      ),
    ),
  },
  SPELLS.BLACKOUT_KICK,
  {
    spell: talents.CHI_BURST_TALENT,
    condition: cnd.hasTalent(talents.CHI_BURST_TALENT),
  },
  SPELLS.TIGER_PALM,
  ...commonBottom,
]);

const rotation_fallback = build([...commonTop, ...commonBottom]);

export enum MistweaverApl {
  RisingMistAncientTeachings,
  Fallback,
}

export const chooseApl = (info: PlayerInfo): MistweaverApl => {
  if (
    info.combatant.hasTalent(talents.ANCIENT_TEACHINGS_TALENT) &&
    info.combatant.hasTalent(talents.RISING_MIST_TALENT)
  ) {
    return MistweaverApl.RisingMistAncientTeachings;
  }
  return MistweaverApl.Fallback;
};

const apls: Record<MistweaverApl, Apl> = {
  [MistweaverApl.RisingMistAncientTeachings]: rotation_rm_at,
  [MistweaverApl.Fallback]: rotation_fallback,
};

export const apl = (info: PlayerInfo): Apl => {
  return apls[chooseApl(info)];
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
