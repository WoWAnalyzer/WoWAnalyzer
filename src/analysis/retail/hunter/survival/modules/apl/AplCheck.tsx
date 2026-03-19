import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { Section, useInfo } from 'interface/guide';
import { AplSectionData } from 'interface/guide/components/Apl';
import SpellLink from 'interface/SpellLink';
import Analyzer from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, {
  Apl,
  build,
  CheckResult,
  PlayerInfo,
  Rule,
  Violation,
} from 'parser/shared/metrics/apl';
import {
  and,
  buffPresent,
  buffMissing,
  buffStacks,
  debuffPresent,
  debuffMissing,
  or,
  spellFractionalCharges,
} from 'parser/shared/metrics/apl/conditions';
import {
  AplViolationExplainers,
  defaultExplainers,
} from 'interface/guide/components/Apl/violations/claims';

const sentinelRules: Rule[] = [
  {
    spell: TALENTS.KILL_COMMAND_SURVIVAL_TALENT,
    condition: buffMissing(SPELLS.TIP_OF_THE_SPEAR_CAST),
  },
  {
    spell: TALENTS.BOOMSTICK_TALENT,
    condition: debuffMissing(SPELLS.SENTINELS_MARK_DEBUFF),
    description: (
      <>
        Cast <SpellLink spell={TALENTS.BOOMSTICK_TALENT} /> if{' '}
        <SpellLink spell={SPELLS.SENTINELS_MARK_DEBUFF} /> is not present.
      </>
    ),
  },
  {
    spell: TALENTS.WILDFIRE_BOMB_TALENT,
    condition: or(
      debuffPresent(SPELLS.SENTINELS_MARK_DEBUFF),
      spellFractionalCharges(TALENTS.WILDFIRE_BOMB_TALENT, { atLeast: 1.7 }),
    ),
    description: (
      <>
        Cast <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} /> if{' '}
        <SpellLink spell={SPELLS.SENTINELS_MARK_DEBUFF} /> is present or you are about to cap
        charges.
      </>
    ),
  },
  {
    spell: TALENTS.TAKEDOWN_TALENT,
    condition: buffMissing(SPELLS.TIP_OF_THE_SPEAR_CAST),
    description: (
      <>
        Cast <SpellLink spell={TALENTS.TAKEDOWN_TALENT} /> if{' '}
        <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} /> is not present.
      </>
    ),
  },
  SPELLS.MOONLIGHT_CHAKRAM_CAST,
  {
    spell: SPELLS.RAPTOR_SWIPE_DAMAGE,
    condition: buffPresent(SPELLS.RAPTOR_SWIPE_BUFF),
    description: (
      <>
        Cast <SpellLink spell={SPELLS.RAPTOR_SWIPE_DAMAGE} />
      </>
    ),
  },
  TALENTS.RAPTOR_STRIKE_TALENT,
  {
    spell: SPELLS.HATCHET_TOSS,
    description: (
      <>
        Never cast <SpellLink spell={SPELLS.HATCHET_TOSS} />.
      </>
    ),
  },
];

const packLeaderRules: Rule[] = [
  {
    spell: TALENTS.KILL_COMMAND_SURVIVAL_TALENT,
    condition: or(
      buffMissing(SPELLS.TIP_OF_THE_SPEAR_CAST),
      and(
        buffMissing(SPELLS.HOWL_OF_THE_PACKLEADER_BUFF),
        buffStacks(SPELLS.TIP_OF_THE_SPEAR_CAST, { atMost: 1 }),
      ),
    ),
    description: (
      <>
        Cast <SpellLink spell={TALENTS.KILL_COMMAND_SURVIVAL_TALENT} /> if{' '}
        <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} /> is missing, or if{' '}
        <SpellLink spell={SPELLS.HOWL_OF_THE_PACKLEADER_BUFF} /> is ready and Tip is at 0-1 stacks.
        stacks.
      </>
    ),
  },
  {
    spell: TALENTS.TAKEDOWN_TALENT,
    condition: buffMissing(SPELLS.TIP_OF_THE_SPEAR_CAST),
    description: (
      <>
        Cast <SpellLink spell={TALENTS.TAKEDOWN_TALENT} /> if not stacks of{' '}
        <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST} /> to maximise Twin Fangs.
      </>
    ),
  },
  TALENTS.BOOMSTICK_TALENT,
  {
    spell: TALENTS.WILDFIRE_BOMB_TALENT,
    condition: and(
      buffPresent(SPELLS.WYVERNS_CRY),
      spellFractionalCharges(TALENTS.WILDFIRE_BOMB_TALENT, { atLeast: 1 }),
    ),
    description: (
      <>
        Cast <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} /> if{' '}
        <SpellLink spell={SPELLS.HOWL_WYVERN_BUFF} /> can be extended.
      </>
    ),
  },
  {
    spell: SPELLS.RAPTOR_SWIPE_DAMAGE,
    condition: buffPresent(SPELLS.RAPTOR_SWIPE_BUFF),
  },
  TALENTS.RAPTOR_STRIKE_TALENT,
  TALENTS.KILL_COMMAND_SURVIVAL_TALENT,
  TALENTS.WILDFIRE_BOMB_TALENT,
  TALENTS.TAKEDOWN_TALENT,
  {
    spell: SPELLS.HATCHET_TOSS,
    description: (
      <>
        Never cast <SpellLink spell={SPELLS.HATCHET_TOSS} />.
      </>
    ),
  },
];

export const apl = (info: PlayerInfo): Apl => {
  if (info.combatant.hasTalent(TALENTS.MOONLIGHT_CHAKRAM_TALENT)) {
    return build(sentinelRules);
  }

  return build(packLeaderRules);
};

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl(info));
  return check(events, info);
};

function KillCommandTipStackNote({ violation }: { violation: Violation }) {
  const info = useInfo();
  if (violation.actualCast.ability.guid !== TALENTS.KILL_COMMAND_SURVIVAL_TALENT.id) {
    return null;
  }

  const tipStacksOnCast = info?.combatant?.getBuffStacks(
    SPELLS.TIP_OF_THE_SPEAR_CAST.id,
    violation.actualCast.timestamp,
  );
  if (tipStacksOnCast === undefined) {
    return null;
  }

  return (
    <p>
      Tip of the Spear stacks on cast: <strong>{tipStacksOnCast}</strong>
    </p>
  );
}

const droppedRuleWithTip: typeof defaultExplainers.droppedRule = {
  ...defaultExplainers.droppedRule,
  describe: (props) => (
    <>
      {defaultExplainers.droppedRule.describe(props)}
      <KillCommandTipStackNote violation={props.violation} />
    </>
  ),
};

const survivalExplainers: AplViolationExplainers = {
  ...defaultExplainers,
  droppedRule: droppedRuleWithTip,
};

export function AplSection() {
  const info = useInfo();
  if (!info) {
    return null;
  }

  return (
    <Section title="Action Priority List">
      <p>
        The general priority for Survival Hunter is to ensure every ability is tipped and that major
        rotational cooldowns are used before filler. The APL Checker cannot account for every
        situation in a fight, so use this as a general guideline rather than a strict rule-set. For
        example, normal priorty is to use Boomstick on cooldown but if the fight is going to end
        before you can get two more uses out of it, ie in less than 1.5 minutes then you can hold
        Boomstick to use during takedown's 20% damage amp for a DPS gain as holding it won't result
        in a lost use like it would in a longer fight.
      </p>
      <AplSectionData checker={check} apl={apl(info)} violationExplainers={survivalExplainers} />
    </Section>
  );
}

export default class AplCheck extends Analyzer {}
