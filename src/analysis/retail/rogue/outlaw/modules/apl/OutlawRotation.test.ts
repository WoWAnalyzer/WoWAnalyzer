import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/rogue';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  EventType,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import aplCheck, { PlayerInfo } from 'parser/shared/metrics/apl';

import { ROLL_THE_BONES_STAGE_AURAS } from '../../constants';
import { outlaw_rotation } from './OutlawRotation';

const PLAYER_ID = 1;

const ability = (spell: Spell) => ({
  guid: spell.id,
  name: spell.name,
  abilityIcon: spell.icon,
});

const cast = (timestamp: number, spell: Spell, comboPoints = 0, energy = 100): CastEvent =>
  ({
    timestamp,
    ability: ability(spell),
    type: EventType.Cast,
    sourceID: PLAYER_ID,
    sourceIsFriendly: true,
    targetID: 11,
    targetInstance: 1,
    targetIsFriendly: false,
    classResources: [
      {
        amount: comboPoints,
        max: 7,
        type: RESOURCE_TYPES.COMBO_POINTS.id,
        cost: comboPoints,
      },
      {
        amount: energy,
        max: 100,
        type: RESOURCE_TYPES.ENERGY.id,
        cost: 0,
      },
    ],
  }) as CastEvent;

const applyBuff = (timestamp: number, spell: Spell): ApplyBuffEvent =>
  ({
    timestamp,
    ability: ability(spell),
    type: EventType.ApplyBuff,
    targetID: PLAYER_ID,
    targetIsFriendly: true,
    sourceID: PLAYER_ID,
    sourceIsFriendly: true,
  }) as ApplyBuffEvent;

const damage = (timestamp: number, spell: Spell, targetID: number): DamageEvent =>
  ({
    timestamp,
    ability: ability(spell),
    type: EventType.Damage,
    sourceID: PLAYER_ID,
    sourceIsFriendly: true,
    targetID,
    targetInstance: 1,
    targetIsFriendly: false,
    amount: 1,
  }) as DamageEvent;

const cooldownRemaining = (
  timestamp: number,
  spell: Spell,
  remaining: number,
): UpdateSpellUsableEvent =>
  ({
    timestamp,
    ability: ability(spell),
    type: EventType.UpdateSpellUsable,
    sourceID: PLAYER_ID,
    sourceIsFriendly: true,
    isAvailable: false,
    updateType: UpdateSpellUsableType.BeginCooldown,
    expectedRechargeTimestamp: timestamp + remaining,
  }) as UpdateSpellUsableEvent;

const cooldownEnded = (timestamp: number, spell: Spell): UpdateSpellUsableEvent =>
  ({
    timestamp,
    ability: ability(spell),
    type: EventType.UpdateSpellUsable,
    sourceID: PLAYER_ID,
    sourceIsFriendly: true,
    isAvailable: true,
    updateType: UpdateSpellUsableType.EndCooldown,
    expectedRechargeTimestamp: timestamp,
  }) as UpdateSpellUsableEvent;

const info = (spells: Spell[], talents: Spell[] = [], endTime = 120000): PlayerInfo =>
  ({
    playerId: PLAYER_ID,
    abilities: spells.map((spell) => ({
      spell: spell.id,
      enabled: true,
    })),
    combatant: {
      owner: {
        fight: {
          start_time: 0,
          end_time: endTime,
        },
      },
      hasTalent: (talent: Spell) => talents.some((knownTalent) => knownTalent.id === talent.id),
      getTalentRank: () => 0,
      hasBuff: () => false,
      has2PieceByTier: () => false,
      has4PieceByTier: () => false,
    },
  }) as unknown as PlayerInfo;

describe('Outlaw APL translation', () => {
  it('does not require Roll the Bones when a stage aura is already active', () => {
    const result = aplCheck(outlaw_rotation)(
      [applyBuff(0, ROLL_THE_BONES_STAGE_AURAS[1]), cast(1000, SPELLS.SINISTER_STRIKE)],
      info([SPELLS.ROLL_THE_BONES, SPELLS.SINISTER_STRIKE]),
    );

    expect(result.violations).toEqual([]);
  });

  it('does not require builder Coup de Grace from the visible Coup de Grace buff alone', () => {
    const result = aplCheck(outlaw_rotation)(
      [applyBuff(0, SPELLS.COUP_DE_GRACE_BUFF), cast(1000, SPELLS.SINISTER_STRIKE)],
      info([SPELLS.COUP_DE_GRACE_CAST, SPELLS.SINISTER_STRIKE], [TALENTS.COUP_DE_GRACE_TALENT]),
    );

    expect(result.violations).toEqual([]);
  });

  it('does not require Between the Eyes immediately after it was cast', () => {
    const result = aplCheck(outlaw_rotation)(
      [
        cast(0, SPELLS.BETWEEN_THE_EYES, 6),
        cooldownRemaining(0, SPELLS.BETWEEN_THE_EYES, 45000),
        cast(1000, SPELLS.DISPATCH, 6),
      ],
      info([SPELLS.BETWEEN_THE_EYES, SPELLS.DISPATCH]),
    );

    expect(result.violations).toEqual([]);
  });

  it('requires Between the Eyes over Dispatch while it is off cooldown', () => {
    const result = aplCheck(outlaw_rotation)(
      [cast(1000, SPELLS.DISPATCH, 6)],
      info([SPELLS.BETWEEN_THE_EYES, SPELLS.DISPATCH]),
    );

    expect(result.violations[0].expectedCast[0].id).toBe(SPELLS.BETWEEN_THE_EYES.id);
  });

  it('requires Between the Eyes again once its cooldown ends', () => {
    const result = aplCheck(outlaw_rotation)(
      [
        cast(0, SPELLS.BETWEEN_THE_EYES, 6),
        cooldownRemaining(0, SPELLS.BETWEEN_THE_EYES, 45000),
        cast(1000, SPELLS.DISPATCH, 6),
        cooldownEnded(30000, SPELLS.BETWEEN_THE_EYES),
        cast(31000, SPELLS.DISPATCH, 6),
      ],
      info([SPELLS.BETWEEN_THE_EYES, SPELLS.DISPATCH]),
    );

    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].actualCast.timestamp).toBe(31000);
    expect(result.violations[0].expectedCast[0].id).toBe(SPELLS.BETWEEN_THE_EYES.id);
  });

  it('finishes one combo point earlier when Between the Eyes is on cooldown with Deal Fate', () => {
    const result = aplCheck(outlaw_rotation)(
      [cooldownRemaining(0, SPELLS.BETWEEN_THE_EYES, 45000), cast(1000, SPELLS.DISPATCH, 3)],
      info(
        [SPELLS.BETWEEN_THE_EYES, SPELLS.DISPATCH, SPELLS.SINISTER_STRIKE],
        [TALENTS.DEAL_FATE_TALENT],
      ),
    );

    expect(result.violations).toEqual([]);
  });

  it('keeps the normal finisher threshold without Deal Fate', () => {
    const result = aplCheck(outlaw_rotation)(
      [cooldownRemaining(0, SPELLS.BETWEEN_THE_EYES, 45000), cast(1000, SPELLS.DISPATCH, 3)],
      info([SPELLS.BETWEEN_THE_EYES, SPELLS.DISPATCH, SPELLS.SINISTER_STRIKE]),
    );

    expect(result.violations[0].expectedCast[0].id).toBe(SPELLS.SINISTER_STRIKE.id);
  });

  it('flags Adrenaline Rush when less than 15 seconds of combat remains', () => {
    const result = aplCheck(outlaw_rotation)(
      [cast(6000, TALENTS.ADRENALINE_RUSH_TALENT), cast(7000, SPELLS.SINISTER_STRIKE)],
      info([TALENTS.ADRENALINE_RUSH_TALENT, SPELLS.SINISTER_STRIKE], [], 20000),
    );

    expect(result.violations[0].actualCast.ability.guid).toBe(TALENTS.ADRENALINE_RUSH_TALENT.id);
    expect(result.violations[0].expectedCast[0].id).toBe(SPELLS.SINISTER_STRIKE.id);
  });

  it('allows Adrenaline Rush when enough combat remains', () => {
    const result = aplCheck(outlaw_rotation)(
      [cast(4000, TALENTS.ADRENALINE_RUSH_TALENT)],
      info([TALENTS.ADRENALINE_RUSH_TALENT, SPELLS.SINISTER_STRIKE], [], 20000),
    );

    expect(result.violations).toEqual([]);
  });

  it('requires Blade Flurry when recent damage proves 2+ active targets and the buff is missing', () => {
    const result = aplCheck(outlaw_rotation)(
      [
        damage(1000, SPELLS.SINISTER_STRIKE, 11),
        damage(1500, SPELLS.SINISTER_STRIKE, 12),
        cast(2000, SPELLS.SINISTER_STRIKE),
      ],
      info([SPELLS.BLADE_FLURRY, SPELLS.SINISTER_STRIKE]),
    );

    expect(result.violations[0].expectedCast[0].id).toBe(SPELLS.BLADE_FLURRY.id);
  });

  it('does not require Blade Flurry in a single-target damage window', () => {
    const result = aplCheck(outlaw_rotation)(
      [damage(1000, SPELLS.SINISTER_STRIKE, 11), cast(2000, SPELLS.SINISTER_STRIKE)],
      info([SPELLS.BLADE_FLURRY, SPELLS.SINISTER_STRIKE]),
    );

    expect(result.violations).toEqual([]);
  });

  it('allows Killing Spree at 5 combo points while Between the Eyes is held for Adrenaline Rush', () => {
    const result = aplCheck(outlaw_rotation)(
      [
        cooldownRemaining(1000, TALENTS.ADRENALINE_RUSH_TALENT, 30000),
        cast(2000, TALENTS.KILLING_SPREE_TALENT, 5),
      ],
      info(
        [SPELLS.BETWEEN_THE_EYES, TALENTS.KILLING_SPREE_TALENT],
        [TALENTS.KILLING_SPREE_TALENT, TALENTS.SUPERCHARGER_TALENT, TALENTS.ZERO_IN_TALENT],
      ),
    );

    expect(result.violations).toEqual([]);
  });

  // Positive-only: a real cast is credited but one is never demanded.
  it('credits a Preparation cast in the window SimC would use it', () => {
    const result = aplCheck(outlaw_rotation)(
      [
        cooldownRemaining(0, TALENTS.ADRENALINE_RUSH_TALENT, 60000),
        cooldownRemaining(0, SPELLS.BETWEEN_THE_EYES, 45000),
        cast(1000, SPELLS.PREPARATION),
      ],
      info(
        [SPELLS.PREPARATION, SPELLS.BETWEEN_THE_EYES, SPELLS.DISPATCH],
        [TALENTS.PREPARATION_TALENT],
      ),
    );

    expect(result.violations).toEqual([]);
    expect(result.successes.at(-1)?.actualCast.ability.guid).toBe(SPELLS.PREPARATION.id);
  });

  it('never demands Preparation, even in the window SimC would use it', () => {
    const result = aplCheck(outlaw_rotation)(
      [
        cooldownRemaining(0, TALENTS.ADRENALINE_RUSH_TALENT, 60000),
        cooldownRemaining(0, SPELLS.BETWEEN_THE_EYES, 45000),
        cast(1000, SPELLS.DISPATCH, 6),
      ],
      info(
        [SPELLS.PREPARATION, SPELLS.BETWEEN_THE_EYES, SPELLS.DISPATCH],
        [TALENTS.PREPARATION_TALENT],
      ),
    );

    expect(
      result.violations.flatMap((violation) => violation.expectedCast.map((spell) => spell.id)),
    ).not.toContain(SPELLS.PREPARATION.id);
  });

  it('never demands Preparation when the fight is ending soon', () => {
    const result = aplCheck(outlaw_rotation)(
      [cast(1000, SPELLS.DISPATCH, 6)],
      info([SPELLS.PREPARATION, SPELLS.DISPATCH], [TALENTS.PREPARATION_TALENT], 20000),
    );

    expect(
      result.violations.flatMap((violation) => violation.expectedCast.map((spell) => spell.id)),
    ).not.toContain(SPELLS.PREPARATION.id);
  });

  it('still prefers Between the Eyes over Dispatch while it is ready', () => {
    const result = aplCheck(outlaw_rotation)(
      [cooldownRemaining(0, TALENTS.ADRENALINE_RUSH_TALENT, 60000), cast(1000, SPELLS.DISPATCH, 6)],
      info(
        [SPELLS.PREPARATION, SPELLS.BETWEEN_THE_EYES, SPELLS.DISPATCH],
        [TALENTS.PREPARATION_TALENT],
      ),
    );

    expect(result.violations[0].expectedCast[0].id).toBe(SPELLS.BETWEEN_THE_EYES.id);
  });

  // Positive-only, because target count is estimated from recent damage.
  it('credits Blade Flurry as a builder at 3 targets with Deft Maneuvers', () => {
    const result = aplCheck(outlaw_rotation)(
      [
        applyBuff(0, SPELLS.BLADE_FLURRY),
        damage(1000, SPELLS.SINISTER_STRIKE, 11),
        damage(1100, SPELLS.SINISTER_STRIKE, 12),
        damage(1200, SPELLS.SINISTER_STRIKE, 13),
        cast(2000, SPELLS.BLADE_FLURRY),
      ],
      info([SPELLS.BLADE_FLURRY, SPELLS.SINISTER_STRIKE], [TALENTS.DEFT_MANEUVERS_TALENT]),
    );

    expect(result.violations).toEqual([]);
  });

  it('never demands the Blade Flurry builder, even at 3 targets with Deft Maneuvers', () => {
    const result = aplCheck(outlaw_rotation)(
      [
        applyBuff(0, SPELLS.BLADE_FLURRY),
        damage(1000, SPELLS.SINISTER_STRIKE, 11),
        damage(1100, SPELLS.SINISTER_STRIKE, 12),
        damage(1200, SPELLS.SINISTER_STRIKE, 13),
        cast(2000, SPELLS.SINISTER_STRIKE),
      ],
      info([SPELLS.BLADE_FLURRY, SPELLS.SINISTER_STRIKE], [TALENTS.DEFT_MANEUVERS_TALENT]),
    );

    expect(result.violations).toEqual([]);
  });
});
