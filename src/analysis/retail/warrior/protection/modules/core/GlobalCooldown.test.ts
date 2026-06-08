import SPELLS from 'common/SPELLS';
import { EventType, GlobalCooldownEvent } from 'parser/core/Events';
import GlobalCooldown from './GlobalCooldown';

function makeGlobalCooldownEvent(
  timestamp: number,
  spellId: number,
  duration = 1500,
): GlobalCooldownEvent {
  return {
    type: EventType.GlobalCooldown,
    timestamp,
    duration,
    sourceID: 1,
    targetID: 1,
    targetIsFriendly: true,
    ability: {
      guid: spellId,
      name: spellId === SPELLS.SHIELD_CHARGE.id ? 'Shield Charge' : 'Test Spell',
      type: 1,
      abilityIcon: '',
    },
    trigger: {
      type: EventType.Cast,
      timestamp,
      sourceID: 1,
      sourceIsFriendly: true,
      targetID: 2,
      targetIsFriendly: false,
      ability: {
        guid: spellId,
        name: spellId === SPELLS.SHIELD_CHARGE.id ? 'Shield Charge' : 'Test Spell',
        type: 1,
        abilityIcon: '',
      },
    },
    __fabricated: true,
  };
}

function makeGlobalCooldownModule(): GlobalCooldown {
  const globalCooldown = Object.create(GlobalCooldown.prototype) as GlobalCooldown;
  globalCooldown._errors = 0;

  return globalCooldown;
}

describe('Protection Warrior GlobalCooldown', () => {
  it('does not mark Shield Charge impact timestamps inaccurate against the previous GCD', () => {
    const globalCooldown = makeGlobalCooldownModule();
    const previousGcd = makeGlobalCooldownEvent(1000, SPELLS.THUNDER_CLAP.id);
    const shieldCharge = makeGlobalCooldownEvent(1100, SPELLS.SHIELD_CHARGE.id);

    globalCooldown.lastGlobalCooldown = previousGcd;
    globalCooldown._verifyAccuracy(shieldCharge);

    expect(globalCooldown._errors).toBe(0);
    expect(globalCooldown.lastGlobalCooldown).toBe(shieldCharge);
  });

  it('does not mark casts after Shield Charge impact timestamps inaccurate', () => {
    const globalCooldown = makeGlobalCooldownModule();
    const shieldCharge = makeGlobalCooldownEvent(1000, SPELLS.SHIELD_CHARGE.id);
    const nextGcd = makeGlobalCooldownEvent(1100, SPELLS.THUNDER_CLAP.id);

    globalCooldown.lastGlobalCooldown = shieldCharge;
    globalCooldown._verifyAccuracy(nextGcd);

    expect(globalCooldown._errors).toBe(0);
    expect(globalCooldown.lastGlobalCooldown).toBe(nextGcd);
  });
});
