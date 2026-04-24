import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { Section, useInfo } from 'interface/guide';
import { AplSectionData } from 'interface/guide/components/Apl';
import SpellLink from 'interface/SpellLink';
import Analyzer from 'parser/core/Analyzer';
import { AnyEvent, EventType } from 'parser/core/Events';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, Rule } from 'parser/shared/metrics/apl';
import {
  and,
  buffPresent,
  buffRemaining,
  or,
  spellAvailable,
  spellCooldownRemaining,
  spellFractionalCharges,
  targetsHit,
} from 'parser/shared/metrics/apl/conditions';
import { BESTIAL_WRATH_DURATION_MS, WITHERING_FIRE_DURATION_MS } from '../../constants';

// --- Talent detection ---

const isDarkRanger = (info: PlayerInfo) =>
  info.combatant.hasTalent(TALENTS.BLACK_ARROW_BEAST_MASTERY_TALENT);

const hasKillerCobra = (info: PlayerInfo) => info.combatant.hasTalent(TALENTS.KILLER_COBRA_TALENT);

// SimC apex.3 = Nature's Ally rank 3 (tiered capstone).
// When talented, Kill Command is gated behind buff checks.
// Without it, Kill Command is unconditional at its priority slot.
const hasNaturesAlly3 = (info: PlayerInfo) =>
  info.combatant.hasTalent(TALENTS.NATURES_ALLY_3_BEAST_MASTERY_TALENT);

// --- Shared rules ---

const barbedShotPreBW = (gcdWindow: number): Rule => ({
  spell: TALENTS.BARBED_SHOT_TALENT,
  condition: spellCooldownRemaining(TALENTS.BESTIAL_WRATH_TALENT, { atMost: gcdWindow }),
  description: (
    <>
      Cast <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} /> when{' '}
      <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} /> is about to come off cooldown
    </>
  ),
});

const bestialWrath: Rule = {
  spell: TALENTS.BESTIAL_WRATH_TALENT,
  condition: spellAvailable(TALENTS.BESTIAL_WRATH_TALENT),
  description: (
    <>
      Cast <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} /> on cooldown
    </>
  ),
};

// --- AoE rules (shared) ---

const aoeWildThrash: Rule = {
  spell: TALENTS.WILD_THRASH_TALENT,
  condition: targetsHit({ atLeast: 2 }, { lookahead: 1000 }),
  description: (
    <>
      Cast <SpellLink spell={TALENTS.WILD_THRASH_TALENT} /> to maintain{' '}
      <SpellLink spell={SPELLS.BEAST_CLEAVE_BUFF} /> on 2+ targets
    </>
  ),
};

const aoeBestialWrathWithBeastCleave: Rule = {
  spell: TALENTS.BESTIAL_WRATH_TALENT,
  condition: and(
    spellAvailable(TALENTS.BESTIAL_WRATH_TALENT),
    buffPresent(SPELLS.BEAST_CLEAVE_BUFF),
    targetsHit({ atLeast: 2 }, { lookahead: 1000 }),
  ),
  description: (
    <>
      Cast <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} /> while{' '}
      <SpellLink spell={SPELLS.BEAST_CLEAVE_BUFF} /> is active
    </>
  ),
};

const aoeBarbedShotChargeCap: Rule = {
  spell: TALENTS.BARBED_SHOT_TALENT,
  condition: spellFractionalCharges(TALENTS.BARBED_SHOT_TALENT, { atLeast: 1.9 }),
  description: (
    <>
      Cast <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} /> to avoid capping charges
    </>
  ),
};

// --- Pack Leader (SimC: actions.st + actions.cleave) ---
//
// ST:
// barbed_shot,if=cooldown.bestial_wrath.remains<gcd
// bestial_wrath
// wild_thrash,if=active_enemies>1
// kill_command,if=cooldown.bestial_wrath.remains>full_recharge_time+gcd
//               &(buff.natures_ally.up|howl_summon.ready)|!apex.3
// barbed_shot
// cobra_shot

const packLeaderKillCommand: Rule = {
  spell: TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT,
  condition: and(
    spellCooldownRemaining(TALENTS.BESTIAL_WRATH_TALENT, { atLeast: 8500 }),
    or(buffPresent(SPELLS.NATURES_ALLY_BUFF), buffPresent(SPELLS.HOWL_OF_THE_PACKLEADER_BUFF)),
  ),
  description: (
    <>
      Cast <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} /> when{' '}
      <SpellLink spell={SPELLS.NATURES_ALLY_BUFF} /> or{' '}
      <SpellLink spell={SPELLS.HOWL_OF_THE_PACKLEADER_BUFF} /> is active and{' '}
      <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} /> is not imminent
    </>
  ),
};

const packLeaderApl = (info: PlayerInfo): Apl => {
  const rules: Rule[] = [
    barbedShotPreBW(1500),
    // AoE: Wild Thrash top priority for Beast Cleave uptime
    aoeWildThrash,
    bestialWrath,
    hasNaturesAlly3(info) ? packLeaderKillCommand : TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT,
    TALENTS.BARBED_SHOT_TALENT,
    TALENTS.COBRA_SHOT_TALENT,
  ];

  return build(rules);
};

// --- Dark Ranger (SimC: actions.drst) ---
//
// barbed_shot,if=cooldown.bestial_wrath.remains<2*gcd
// bestial_wrath
// kill_command,if=cooldown.bestial_wrath.remains>full_recharge_time+gcd
//               &buff.natures_ally.up|!apex.3
// black_arrow,if=buff.withering_fire.up
// wailing_arrow,if=buff.withering_fire.remains<execute_time+2*gcd
//                 |time_to_die.remains<execute_time+gcd
// cobra_shot,if=talent.killer_cobra&buff.bestial_wrath.up
//              &cooldown.barbed_shot.charges_fractional<1.4
// barbed_shot
// black_arrow
// cobra_shot

const darkRangerKillCommand: Rule = {
  spell: TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT,
  condition: and(
    spellCooldownRemaining(TALENTS.BESTIAL_WRATH_TALENT, { atLeast: 8500 }),
    buffPresent(SPELLS.NATURES_ALLY_BUFF),
  ),
  description: (
    <>
      Cast <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} /> when{' '}
      <SpellLink spell={SPELLS.NATURES_ALLY_BUFF} /> is active and{' '}
      <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} /> is not imminent
    </>
  ),
};

const blackArrowWitheringFire: Rule = {
  spell: TALENTS.BLACK_ARROW_BEAST_MASTERY_TALENT,
  condition: buffPresent(SPELLS.WITHERING_FIRE_BUFF),
  description: (
    <>
      Cast <SpellLink spell={TALENTS.BLACK_ARROW_BEAST_MASTERY_TALENT} /> during{' '}
      <SpellLink spell={SPELLS.WITHERING_FIRE_BUFF} />
    </>
  ),
};

// SimC fires Wailing Arrow when remains < execute_time(2s) + 2*gcd(3s) ≈ 5s.
const WAILING_ARROW_CAST_PLUS_2GCD = 5000;

const wailingArrowNotRecentlyCast = {
  key: 'wailing-arrow-not-recently-cast',
  init: () => null as number | null,
  update: (state: number | null, event: AnyEvent) => {
    if (event.type === EventType.Cast && event.ability.guid === SPELLS.WAILING_ARROW_DAMAGE.id) {
      return event.timestamp;
    }
    return state;
  },
  validate: (state: number | null, event: AnyEvent) =>
    state === null || event.timestamp - state > BESTIAL_WRATH_DURATION_MS,
  // This should not activate since withering arrow can only be cast once during bestial wrath
  describe: () => (
    <>
      <SpellLink spell={SPELLS.WAILING_ARROW_DAMAGE} /> not cast in the last{' '}
      {BESTIAL_WRATH_DURATION_MS / 1000} seconds
    </>
  ),
};

const wailingArrow: Rule = {
  spell: SPELLS.WAILING_ARROW_DAMAGE,
  condition: and(
    buffRemaining(SPELLS.WITHERING_FIRE_BUFF, WITHERING_FIRE_DURATION_MS, {
      atMost: WAILING_ARROW_CAST_PLUS_2GCD,
    }),
    wailingArrowNotRecentlyCast,
  ),
  description: (
    <>
      Cast <SpellLink spell={SPELLS.WAILING_ARROW_DAMAGE} /> before{' '}
      <SpellLink spell={SPELLS.WITHERING_FIRE_BUFF} /> expires
    </>
  ),
};

const killerCobraDarkRanger: Rule = {
  spell: TALENTS.COBRA_SHOT_TALENT,
  condition: and(
    buffPresent(TALENTS.BESTIAL_WRATH_TALENT),
    spellFractionalCharges(TALENTS.BARBED_SHOT_TALENT, { atMost: 1.4 }),
  ),
  description: (
    <>
      Cast <SpellLink spell={TALENTS.COBRA_SHOT_TALENT} /> during{' '}
      <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} /> when{' '}
      <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} /> charges are low
    </>
  ),
};

const darkRangerApl = (info: PlayerInfo): Apl => {
  const rules: Rule[] = [
    barbedShotPreBW(3000),
    // AoE: BW only with Beast Cleave active; Wild Thrash top priority
    aoeBestialWrathWithBeastCleave,
    // AoE: Wild Thrash for Beast Cleave uptime
    aoeWildThrash,
    // ST: BW unconditional (fires when AoE BW rule doesn't match)
    bestialWrath,
    hasNaturesAlly3(info) ? darkRangerKillCommand : TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT,
    // AoE: prevent Barbed Shot charge cap (higher priority than BA/WA in AoE)
    aoeBarbedShotChargeCap,
    blackArrowWitheringFire,
    wailingArrow,
  ];

  if (hasKillerCobra(info)) {
    rules.push(killerCobraDarkRanger);
  }

  rules.push(
    TALENTS.BARBED_SHOT_TALENT,
    TALENTS.BLACK_ARROW_BEAST_MASTERY_TALENT,
    TALENTS.COBRA_SHOT_TALENT,
  );

  return build(rules);
};

// --- Public API ---

export const apl = (info: PlayerInfo): Apl =>
  isDarkRanger(info) ? darkRangerApl(info) : packLeaderApl(info);

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const checker = aplCheck(apl(info));
  return checker(events, info);
};

export function AplSection() {
  const info = useInfo();
  if (!info) {
    return null;
  }

  return (
    <Section title="Action Priority List">
      <p>
        The Beast Mastery priority revolves around buffing Kill Command with Nature's Ally or Howl
        of the Pack Leader before spending it. The APL checker cannot account for every situation in
        a fight, so use this as a general guideline rather than a strict rule set.
      </p>
      <AplSectionData checker={check} apl={apl(info)} />
    </Section>
  );
}

export default class AplCheck extends Analyzer {}
