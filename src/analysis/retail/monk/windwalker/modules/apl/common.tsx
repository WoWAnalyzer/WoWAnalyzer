import type Spell from 'common/SPELLS/Spell';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/monk';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellLink from 'interface/SpellLink';
import Combatant from 'parser/core/Combatant';
import { EventType } from 'parser/core/Events';
import { Apl, Condition, Rule, build, tenseAlt } from 'parser/shared/metrics/apl';
import {
  and,
  buffPresent,
  buffRemaining,
  buffStacks,
  describe,
  hasResource,
  hasTalent,
  optionalRule,
  not,
} from 'parser/shared/metrics/apl/conditions';
import {
  ASCENSION_ENERGY_MAX_ADDITION,
  BASE_ENERGY_MAX,
  INNER_PEACE_ENERGY_MAX_ADDITION,
} from '../resources/EnergyCapTracker';
import { ABILITIES_AFFECTED_BY_MASTERY } from '../../constants';

const DANCE_OF_CHI_JI_DURATION_MS = 15000;
export const BASE_ZENITH_DURATION_MS = 20000;

const MASTERY_AFFECTED_IDS = new Set(ABILITIES_AFFECTED_BY_MASTERY.map((spell) => spell.id));

function lastMasterySpellCast(spell: Spell): Condition<boolean> {
  let sourceID: number;
  return {
    key: `lastMasterySpellCast-${spell.id}`,
    init: (info) => {
      sourceID = info.playerId;
      return false;
    },
    update: (state, event) => {
      if (event.type !== EventType.Cast || event.sourceID !== sourceID) {
        return state;
      }
      if (!MASTERY_AFFECTED_IDS.has(event.ability.guid)) {
        return state;
      }
      return event.ability.guid === spell.id;
    },
    validate: (state) => state,
    describe: () => (
      <>
        your last mastery-relevant cast was <SpellLink spell={spell.id} />
      </>
    ),
  };
}

const comboStrikesSafe = (spell: Spell) => not(lastMasterySpellCast(spell));

const comboStrikesCondition = (spell: Spell | Spell[]) =>
  Array.isArray(spell)
    ? and(...spell.map((candidate) => comboStrikesSafe(candidate)))
    : comboStrikesSafe(spell);

function withHiddenConstraint<Visible, Hidden>(
  visibleCondition: Condition<Visible> | undefined,
  hiddenCondition: Condition<Hidden>,
): Condition<{ visibleCondition?: Visible; hiddenCondition: Hidden }> {
  return {
    key: visibleCondition
      ? `visible-${visibleCondition.key}-hidden-${hiddenCondition.key}`
      : `hidden-${hiddenCondition.key}`,
    lookahead:
      visibleCondition?.lookahead || hiddenCondition.lookahead
        ? Math.max(visibleCondition?.lookahead ?? 0, hiddenCondition.lookahead ?? 0)
        : undefined,
    init: (info) => ({
      visibleCondition: visibleCondition?.init(info),
      hiddenCondition: hiddenCondition.init(info),
    }),
    update: (state, event) => ({
      visibleCondition: visibleCondition
        ? visibleCondition.update(state.visibleCondition!, event)
        : state.visibleCondition,
      hiddenCondition: hiddenCondition.update(state.hiddenCondition, event),
    }),
    validate: (state, event, spell, lookahead) =>
      hiddenCondition.validate(state.hiddenCondition, event, spell, lookahead) &&
      (visibleCondition
        ? visibleCondition.validate(state.visibleCondition!, event, spell, lookahead)
        : true),
    describe: (tense) => visibleCondition?.describe(tense) ?? '',
    tooltip: visibleCondition?.tooltip,
    prefix: visibleCondition?.prefix,
  };
}

/**
 * Applies Windwalker's Combo Strikes mastery constraint to a rule target while
 * preserving any existing rule condition.
 */
function injectComboStrikesRule(rule: Rule): Rule {
  if (Array.isArray(rule)) {
    return {
      spell: rule,
      condition: withHiddenConstraint(undefined, comboStrikesCondition(rule)),
    };
  }

  if ('spell' in rule) {
    return {
      ...rule,
      condition: withHiddenConstraint(
        'condition' in rule ? rule.condition : undefined,
        comboStrikesCondition(rule.spell),
      ),
    };
  }

  return {
    spell: rule,
    condition: withHiddenConstraint(undefined, comboStrikesCondition(rule)),
  };
}

/**
 * Builds a Windwalker APL with Combo Strikes enforcement injected into every
 * rule, so the APL does not recommend repeating the same spell twice in a row.
 */
export function buildComboStrikesApl(rules: Rule[]): Apl {
  return build(rules.map(injectComboStrikesRule));
}

/**
 * Treats the player as "about to cap" energy once they are within 15% of their
 * current maximum energy after accounting for Ascension and Inner Peace.
 */
export const aboutToCapEnergy = (combatant: Combatant) =>
  hasResource(RESOURCE_TYPES.ENERGY, {
    atLeast:
      (BASE_ENERGY_MAX +
        (combatant.hasTalent(TALENTS.ASCENSION_TALENT) ? ASCENSION_ENERGY_MAX_ADDITION : 0) +
        (combatant.hasTalent(TALENTS.INNER_PEACE_TALENT) ? INNER_PEACE_ENERGY_MAX_ADDITION : 0)) *
      0.85,
  });

export function fistsOfFuryChiCost(combatant: Combatant) {
  return combatant.hasTalent(TALENTS.HARMONIC_COMBO_TALENT) ? 2 : 3;
}

export function notEnoughChiForFistsOfFury(combatant: Combatant) {
  return hasResource(RESOURCE_TYPES.CHI, { atMost: fistsOfFuryChiCost(combatant) - 1 });
}

/**
 * Combo Breaker is considered "not capped" until Blackout Kick! reaches 2
 * stacks, which is the point where further proc value can be lost.
 */
export const notAtTwoBlackoutKickStacks = buffStacks(SPELLS.COMBO_BREAKER_BUFF, { atMost: 1 });
export const atTwoBlackoutKickStacks = buffStacks(SPELLS.COMBO_BREAKER_BUFF, { atLeast: 2 });

/**
 * During Zenith with Obsidian Spiral, Tiger Palm and expiring Dance of Chi-Ji
 * fillers should be suppressed to minimize low-value globals inside cooldowns.
 */
export const notInZenithWithObsidianSpiral = not(
  and(hasTalent(TALENTS.OBSIDIAN_SPIRAL_TALENT), buffPresent(TALENTS.ZENITH_TALENT)),
);

/**
 * Whirling Dragon Punch becomes available once both Rising Sun Kick and Fists
 * of Fury are on cooldown.
 */
export const whirlingDragonPunchReady = describe(
  buffPresent(SPELLS.WHIRLING_DRAGON_PUNCH_USABLE),
  (tense) => (
    <>
      <SpellLink spell={TALENTS.RISING_SUN_KICK_TALENT} /> and{' '}
      <SpellLink spell={TALENTS.FISTS_OF_FURY_TALENT} /> {tenseAlt(tense, 'are', 'were')} on
      cooldown.
    </>
  ),
);

/**
 * Flags Dance of Chi-Ji procs that are close enough to expiring that the proc
 * should be spent immediately.
 */
export const danceOfChiJiExpiring = and(
  buffPresent(SPELLS.DANCE_OF_CHI_JI_BUFF),
  buffRemaining(SPELLS.DANCE_OF_CHI_JI_BUFF, DANCE_OF_CHI_JI_DURATION_MS, { atMost: 4000 }),
);

export function getZenithDurationMs(combatant: Combatant) {
  return (
    BASE_ZENITH_DURATION_MS + (combatant.hasTalent(TALENTS.DRINKING_HORN_COVER_TALENT) ? 5000 : 0)
  );
}

/**
 * Touch of Death castability depends on game state the analyzer does not
 * currently model precisely, so it should appear in the priority list without
 * generating missed-use violations.
 */
export const optionalTouchOfDeath = optionalRule(
  describe(hasResource(RESOURCE_TYPES.ENERGY, { atLeast: 0 }), () => <>available</>),
  undefined,
  '',
);
