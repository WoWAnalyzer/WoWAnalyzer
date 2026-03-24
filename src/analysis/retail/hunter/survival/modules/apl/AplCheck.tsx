import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { Section, useInfo } from 'interface/guide';
import { AplSectionData } from 'interface/guide/components/Apl';
import SpellLink from 'interface/SpellLink';
import Analyzer from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, Rule } from 'parser/shared/metrics/apl';
import {
  buffMissing,
  debuffPresent,
  or,
  spellFractionalCharges,
} from 'parser/shared/metrics/apl/conditions';

// APL Is based on feelycraft APL for prepatch. Will need update when Sim APL is available.
const sentinelRules: Rule[] = [
  {
    spell: TALENTS.KILL_COMMAND_SURVIVAL_TALENT,
    condition: buffMissing(SPELLS.TIP_OF_THE_SPEAR_CAST),
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
  TALENTS.TAKEDOWN_TALENT,
  TALENTS.BOOMSTICK_TALENT,
  TALENTS.MOONLIGHT_CHAKRAM_TALENT,
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
    condition: buffMissing(SPELLS.TIP_OF_THE_SPEAR_CAST),
  },
  TALENTS.BOOMSTICK_TALENT,
  TALENTS.TAKEDOWN_TALENT,
  TALENTS.WILDFIRE_BOMB_TALENT,
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
      <AplSectionData checker={check} apl={apl(info)} />
    </Section>
  );
}

export default class AplCheck extends Analyzer {}
