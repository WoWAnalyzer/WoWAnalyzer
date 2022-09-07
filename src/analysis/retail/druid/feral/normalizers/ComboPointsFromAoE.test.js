import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { EventType } from 'parser/core/Events';

// import ComboPointsFromAoE from './ComboPointsFromAoE';
const ComboPointsFromAoE = {};

describe.skip('Druid/Feral/Normalizers/ComboPointsFromAoE', () => {
  const playerId = 1;
  const otherPlayerId = 2;
  const enemyId = 3;
  const otherEnemyId = 4;
  const scenarios = [
    {
      it: 'generates combo point energize if Swipe (cat) hits',
      events: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // AoE does damage
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
      expected: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // fabricated combo point energize
          __fabricated: true,
          timestamp: 1,
          type: EventType.Energize,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: playerId,
          targetIsFriendly: true,
          resourceChangeType: RESOURCE_TYPES.COMBO_POINTS.id,
          resourceChange: 1,
          waste: 0,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // AoE does damage
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
    },
    {
      it: 'generates combo point energize if Thrash (cat) hits',
      events: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.THRASH_FERAL.id },
        },
        {
          // AoE does damage
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.THRASH_FERAL.id },
        },
      ],
      expected: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.THRASH_FERAL.id },
        },
        {
          // fabricated combo point energize
          __fabricated: true,
          timestamp: 1,
          type: EventType.Energize,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: playerId,
          targetIsFriendly: true,
          resourceChangeType: RESOURCE_TYPES.COMBO_POINTS.id,
          resourceChange: 1,
          waste: 0,
          ability: { guid: SPELLS.THRASH_FERAL.id },
        },
        {
          // AoE does damage
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.THRASH_FERAL.id },
        },
      ],
    },
    /* {
      it: 'generates combo point energize if Brutal Slash hits',
      events: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.BRUTAL_SLASH_TALENT.id },
        },
        {
          // AoE does damage
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.BRUTAL_SLASH_TALENT.id },
        },
      ],
      expected: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.BRUTAL_SLASH_TALENT.id },
        },
        {
          // fabricated combo point energize
          __fabricated: true,
          timestamp: 1,
          type: EventType.Energize,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: playerId,
          targetIsFriendly: true,
          resourceChangeType: RESOURCE_TYPES.COMBO_POINTS.id,
          resourceChange: 1,
          waste: 0,
          ability: { guid: SPELLS.BRUTAL_SLASH_TALENT.id },
        },
        {
          // AoE does damage
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.BRUTAL_SLASH_TALENT.id },
        },
      ],
    }, */
    {
      it: 'only generates once per cast, even if multiple damage events',
      events: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // AoE does damage
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // AoE does damage to a second target
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: otherEnemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // AoE does damage to the first target again
          timestamp: 3,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
      expected: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // fabricated combo point energize
          __fabricated: true,
          timestamp: 1,
          type: EventType.Energize,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: playerId,
          targetIsFriendly: true,
          resourceChangeType: RESOURCE_TYPES.COMBO_POINTS.id,
          resourceChange: 1,
          waste: 0,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // AoE does damage
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // AoE does damage to a second target
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId + 1,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // AoE does damage to the first target again
          timestamp: 3,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
    },
    {
      it: "doesn't generate if the damage event fails to connect",
      events: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // AoE damage event, but is parried so does 0 damge
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 0,
          hitType: HIT_TYPES.PARRY,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
      expected: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // AoE damage event, but is parried so does 0 damge
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 0,
          hitType: HIT_TYPES.PARRY,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
    },
    {
      it: "doesn't generate if damage event is from another ability",
      events: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // damage from a different AoE ability
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.THRASH_FERAL.id },
        },
      ],
      expected: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // damage from a different AoE ability
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.THRASH_FERAL.id },
        },
      ],
    },
    {
      it: "doesn't generate if damage event is from another player",
      events: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // damage event from same ability, but a different player
          timestamp: 2,
          type: EventType.Damage,
          sourceID: otherPlayerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
      expected: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // damage event from same ability, but a different player
          timestamp: 2,
          type: EventType.Damage,
          sourceID: otherPlayerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
    },
    {
      it: 'generated event shows waste if player is already at full combo points',
      events: [
        {
          // energize to 5/5 combo points
          timestamp: 1,
          type: EventType.Energize,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: playerId,
          targetIsFriendly: true,
          resourceChangeType: RESOURCE_TYPES.COMBO_POINTS.id,
          resourceChange: 5,
          waste: 0,
          ability: { guid: SPELLS.SHRED.id },
        },
        {
          // cast AoE
          timestamp: 2,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // damage from AoE
          timestamp: 3,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
      expected: [
        {
          // energize to 5/5 combo points
          timestamp: 1,
          type: EventType.Energize,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: playerId,
          targetIsFriendly: true,
          resourceChangeType: RESOURCE_TYPES.COMBO_POINTS.id,
          resourceChange: 5,
          waste: 0,
          ability: { guid: SPELLS.SHRED.id },
        },
        {
          // cast AoE
          timestamp: 2,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // fabricated combo point energize, showing it wasted a combo point
          __fabricated: true,
          timestamp: 2,
          type: EventType.Energize,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: playerId,
          targetIsFriendly: true,
          resourceChangeType: RESOURCE_TYPES.COMBO_POINTS.id,
          resourceChange: 1,
          waste: 1,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // damage from AoE
          timestamp: 3,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
    },
    {
      it:
        "generated event doesn't show waste if player was at full combo points earlier but spent them",
      events: [
        {
          // generate 5 combo points
          timestamp: 1,
          type: EventType.Energize,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: playerId,
          targetIsFriendly: true,
          resourceChangeType: RESOURCE_TYPES.COMBO_POINTS.id,
          resourceChange: 5,
          waste: 0,
          ability: { guid: SPELLS.SHRED.id },
        },
        {
          // spend 5 combo points
          timestamp: 2,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.RIP.id },
          classResources: [
            {
              amount: 5,
              cost: 5,
              max: 5,
              type: RESOURCE_TYPES.COMBO_POINTS.id,
            },
          ],
        },
        {
          // cast AoE
          timestamp: 3,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // AoE does damage
          timestamp: 4,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
      expected: [
        {
          // generate 5 combo points
          timestamp: 1,
          type: EventType.Energize,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: playerId,
          targetIsFriendly: true,
          resourceChangeType: RESOURCE_TYPES.COMBO_POINTS.id,
          resourceChange: 5,
          waste: 0,
          ability: { guid: SPELLS.SHRED.id },
        },
        {
          // spend 5 combo points
          timestamp: 2,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.RIP.id },
          classResources: [
            {
              amount: 5,
              cost: 5,
              max: 5,
              type: RESOURCE_TYPES.COMBO_POINTS.id,
            },
          ],
        },
        {
          // cast AoE
          timestamp: 3,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // fabricated energize event showing no waste
          __fabricated: true,
          timestamp: 3,
          type: EventType.Energize,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: playerId,
          targetIsFriendly: true,
          resourceChangeType: RESOURCE_TYPES.COMBO_POINTS.id,
          resourceChange: 1,
          waste: 0,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // AoE does damage
          timestamp: 4,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
    },
    {
      it: "doesn't generate if damage event is significantly later than cast",
      events: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // damage from AoE 5 seconds after the cast
          timestamp: 5000,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
      expected: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // damage from AoE 5 seconds after the cast
          timestamp: 5000,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
    },
    {
      it: 'copes with other events happening at the same time',
      events: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // energy energize from another ability
          timestamp: 1,
          type: EventType.Energize,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: playerId,
          targetIsFriendly: true,
          resourceChangeType: RESOURCE_TYPES.ENERGY.id,
          resourceChange: 50,
          waste: 0,
          ability: { guid: SPELLS.TIGERS_FURY.id },
        },
        {
          // cast another ability
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.MELEE.id },
        },
        {
          // damage from another ability
          timestamp: 1,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 50,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.MELEE.id },
        },
        {
          // damage from AoE
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
      expected: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // fabricated combo point energize
          __fabricated: true,
          timestamp: 1,
          type: EventType.Energize,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: playerId,
          targetIsFriendly: true,
          resourceChangeType: RESOURCE_TYPES.COMBO_POINTS.id,
          resourceChange: 1,
          waste: 0,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // energy energize from another ability
          timestamp: 1,
          type: EventType.Energize,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: playerId,
          targetIsFriendly: true,
          resourceChangeType: RESOURCE_TYPES.ENERGY.id,
          resourceChange: 50,
          waste: 0,
          ability: { guid: SPELLS.TIGERS_FURY.id },
        },
        {
          // cast another ability
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.MELEE.id },
        },
        {
          // damage from another ability
          timestamp: 1,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 50,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.MELEE.id },
        },
        {
          // damage from AoE
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
    },
    {
      it: "doesn't generate if there's already an energize event for the cast",
      events: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // energize combo points from AoE
          timestamp: 1,
          type: EventType.Energize,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: playerId,
          targetIsFriendly: true,
          resourceChangeType: RESOURCE_TYPES.COMBO_POINTS.id,
          resourceChange: 1,
          waste: 0,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // damage from AoE
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
      expected: [
        {
          // cast AoE
          timestamp: 1,
          type: EventType.Cast,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // energize combo points from AoE
          timestamp: 1,
          type: EventType.Energize,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: playerId,
          targetIsFriendly: true,
          resourceChangeType: RESOURCE_TYPES.COMBO_POINTS.id,
          resourceChange: 1,
          waste: 0,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
        {
          // damage from AoE
          timestamp: 2,
          type: EventType.Damage,
          sourceID: playerId,
          sourceIsFriendly: true,
          targetID: enemyId,
          targetIsFriendly: false,
          absorbed: 0,
          amount: 100,
          hitType: HIT_TYPES.NORMAL,
          ability: { guid: SPELLS.SWIPE_CAT.id },
        },
      ],
    },
  ];

  scenarios.forEach((scenario) => {
    it(scenario.it, () => {
      const parser = new ComboPointsFromAoE({});
      parser.playerId = playerId;
      expect(parser.normalize(scenario.events)).toEqual(scenario.expected);
    });
  });
});
