import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, {
  Apl,
  build,
  CheckResult,
  Condition,
  PlayerInfo,
  tenseAlt,
} from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import talents from 'common/TALENTS/monk';
import { AnyEvent, GetRelatedEvents } from 'parser/core/Events';
import { SpellLink } from 'interface';
import { KS_DAMAGE, PTA_TRIGGER_BUFF } from '../talents/PressTheAdvantage/normalizer';
import { BOF_TARGET_HIT } from '../spells/BreathOfFire/normalizer';

const withCombo = cnd.buffPresent(SPELLS.BLACKOUT_COMBO_BUFF);
const bofInAOE = cnd.targetsHit({ atLeast: 3 }, { targetLinkRelation: BOF_TARGET_HIT });

const SCK_AOE = {
  spell: SPELLS.SPINNING_CRANE_KICK_BRM,
  condition: cnd.targetsHit(
    { atLeast: 2 },
    {
      targetSpell: SPELLS.SPINNING_CRANE_KICK_DAMAGE,
    },
  ),
};

const spendPtaCondition: Condition<null> = {
  key: 'pta-trigger',
  init: () => null,
  update: () => null,
  describe: (tense) => (
    <>
      you {tenseAlt(tense, <>have</>, <>had</>)} 10 stacks of{' '}
      <SpellLink spell={talents.PRESS_THE_ADVANTAGE_TALENT} />
    </>
  ),
  validate: (_state, event, _spell) => {
    return GetRelatedEvents(event, PTA_TRIGGER_BUFF).length > 0;
  },
};

const standardApl = build([
  SPELLS.BLACKOUT_KICK_BRM,
  {
    spell: [
      talents.RISING_SUN_KICK_TALENT,
      talents.CHI_BURST_SHARED_TALENT,
      talents.RUSHING_JADE_WIND_BREWMASTER_TALENT,
    ],
    condition: cnd.optionalRule(
      cnd.and(withCombo, cnd.spellCooldownRemaining(SPELLS.BLACKOUT_KICK_BRM, { atLeast: 1000 })),
    ),
    description: (
      <>
        (Optional) You can cast non-<SpellLink spell={SPELLS.BLACKOUT_COMBO_BUFF}>Combo</SpellLink>{' '}
        abilities like <SpellLink spell={talents.RISING_SUN_KICK_TALENT} /> before spending{' '}
        <SpellLink spell={SPELLS.BLACKOUT_COMBO_BUFF} /> if it won't delay{' '}
        <SpellLink spell={SPELLS.BLACKOUT_KICK_BRM} />
      </>
    ),
  },
  {
    spell: talents.BREATH_OF_FIRE_TALENT,
    condition: cnd.and(withCombo, bofInAOE),
  },
  {
    spell: SPELLS.TIGER_PALM,
    condition: withCombo,
  },
  talents.KEG_SMASH_TALENT,
  talents.BREATH_OF_FIRE_TALENT,
  talents.RISING_SUN_KICK_TALENT,
  talents.CHI_BURST_SHARED_TALENT,
  talents.RUSHING_JADE_WIND_BREWMASTER_TALENT,
  SCK_AOE,
  SPELLS.TIGER_PALM,
]);

const ptaApl = build([
  {
    spell: talents.BREATH_OF_FIRE_TALENT,
    condition: cnd.and(
      cnd.buffPresent(SPELLS.BLACKOUT_COMBO_BUFF),
      cnd.spellCooldownRemaining(SPELLS.BLACKOUT_KICK_BRM, { atMost: 2000 }),
      bofInAOE,
    ),
    description: (
      <>
        Cast <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} /> to spend{' '}
        <SpellLink spell={SPELLS.BLACKOUT_COMBO_BUFF} /> if{' '}
        <SpellLink spell={SPELLS.BLACKOUT_KICK_BRM} /> is about to come off cooldown.
      </>
    ),
  },
  SPELLS.BLACKOUT_KICK_BRM,

  {
    spell: talents.KEG_SMASH_TALENT,
    condition: cnd.or(
      cnd.not(spendPtaCondition),
      cnd.targetsHit(
        { atLeast: 4 },
        {
          targetLinkRelation: KS_DAMAGE,
        },
      ),
    ),
  },
  {
    spell: talents.RISING_SUN_KICK_TALENT,
    condition: spendPtaCondition,
  },
  talents.RISING_SUN_KICK_TALENT,
  talents.CHI_BURST_SHARED_TALENT,
  talents.RUSHING_JADE_WIND_BREWMASTER_TALENT,
  SCK_AOE,
]);

export enum BrewmasterApl {
  Standard,
  PTA,
}

export const chooseApl = (info: PlayerInfo): BrewmasterApl => {
  if (!info.combatant.hasTalent(talents.PRESS_THE_ADVANTAGE_TALENT)) {
    return BrewmasterApl.Standard;
  } else {
    return BrewmasterApl.PTA;
  }
};

const apls = {
  [BrewmasterApl.Standard]: standardApl,
  [BrewmasterApl.PTA]: ptaApl,
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
