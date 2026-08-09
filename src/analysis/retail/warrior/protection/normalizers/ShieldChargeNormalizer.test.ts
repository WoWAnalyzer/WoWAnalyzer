import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { AnyEvent, CastEvent, DamageEvent, EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import ShieldChargeNormalizer from './ShieldChargeNormalizer';

const PLAYER_ID = 1;
const TARGET_ID = 2;

function makeOptions(hasShieldCharge = true): Options {
  return {
    owner: {
      selectedCombatant: {
        id: PLAYER_ID,
        hasTalent: (talent: { id: number }) =>
          hasShieldCharge && talent.id === TALENTS.SHIELD_CHARGE_TALENT.id,
      },
    },
    priority: 0,
  } as unknown as Options;
}

function makeDamage(timestamp: number, targetID = TARGET_ID): DamageEvent {
  return {
    type: EventType.Damage,
    timestamp,
    sourceID: PLAYER_ID,
    sourceIsFriendly: true,
    targetID,
    targetInstance: 1,
    targetIsFriendly: false,
    ability: {
      guid: SPELLS.SHIELD_CHARGE.id,
      name: SPELLS.SHIELD_CHARGE.name,
      type: 1,
      abilityIcon: SPELLS.SHIELD_CHARGE.icon,
    },
    hitType: 1,
    amount: 1,
    spellPower: 0,
  };
}

function makeCast(timestamp: number): CastEvent {
  return {
    type: EventType.Cast,
    timestamp,
    sourceID: PLAYER_ID,
    sourceIsFriendly: true,
    targetID: TARGET_ID,
    targetIsFriendly: false,
    ability: {
      guid: SPELLS.SHIELD_CHARGE.id,
      name: SPELLS.SHIELD_CHARGE.name,
      type: 1,
      abilityIcon: SPELLS.SHIELD_CHARGE.icon,
    },
  };
}

function shieldChargeCasts(events: AnyEvent[]): CastEvent[] {
  return events.filter(
    (event): event is CastEvent =>
      event.type === EventType.Cast && event.ability.guid === SPELLS.SHIELD_CHARGE.id,
  );
}

describe('ShieldChargeNormalizer', () => {
  it('fabricates a cast from Shield Charge damage when WCL omits the cast', () => {
    const normalizer = new ShieldChargeNormalizer(makeOptions());
    const damage = makeDamage(1000);

    const result = normalizer.normalize([damage]);
    const casts = shieldChargeCasts(result);

    expect(casts).toHaveLength(1);
    expect(casts[0]).toMatchObject({
      timestamp: damage.timestamp,
      sourceID: PLAYER_ID,
      targetID: TARGET_ID,
      __fabricated: true,
    });
    expect(result.indexOf(casts[0])).toBeLessThan(result.indexOf(damage));
  });

  it('coalesces multi-target Shield Charge damage into one fabricated cast', () => {
    const normalizer = new ShieldChargeNormalizer(makeOptions());
    const firstDamage = makeDamage(1000, TARGET_ID);
    const secondDamage = makeDamage(1025, 3);

    const result = normalizer.normalize([firstDamage, secondDamage]);

    expect(shieldChargeCasts(result)).toHaveLength(1);
  });

  it('does not fabricate a duplicate when WCL logs the cast near impact damage', () => {
    const normalizer = new ShieldChargeNormalizer(makeOptions());
    const cast = makeCast(1000);
    const damage = makeDamage(1100);

    const result = normalizer.normalize([cast, damage]);
    const casts = shieldChargeCasts(result);

    expect(casts).toHaveLength(1);
    expect(casts[0]).toBe(cast);
  });

  it('is inactive when Shield Charge is not talented', () => {
    const normalizer = new ShieldChargeNormalizer(makeOptions(false));

    expect(normalizer.active).toBe(false);
  });
});
