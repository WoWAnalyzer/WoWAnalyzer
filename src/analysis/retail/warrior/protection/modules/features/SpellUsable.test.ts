import SPELLS from 'common/SPELLS';
import {
  AnyEvent,
  EventType,
  ApplyBuffEvent,
  CastEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import type { Annotation } from 'parser/core/modules/DebugAnnotations';
import EventEmitter from 'parser/core/modules/EventEmitter';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';
import SpellUsable from './SpellUsable';

function makeCast(timestamp: number, spellId: number): CastEvent {
  return {
    type: EventType.Cast,
    timestamp,
    sourceID: 1,
    sourceIsFriendly: true,
    targetID: 2,
    targetIsFriendly: false,
    ability: {
      guid: spellId,
      name: 'Test Spell',
      type: 1,
      abilityIcon: '',
    },
  };
}

function makeApplyBuff(timestamp: number, spellId: number): ApplyBuffEvent {
  return {
    type: EventType.ApplyBuff,
    timestamp,
    sourceID: 1,
    sourceIsFriendly: true,
    targetID: 1,
    targetIsFriendly: true,
    ability: {
      guid: spellId,
      name: 'Test Buff',
      type: 1,
      abilityIcon: '',
    },
  };
}

function makeSpellUsable() {
  const parser = new TestCombatLogParser();
  const eventEmitter = parser.getModule(EventEmitter);
  const thunderClapAbility = {
    spell: [SPELLS.THUNDER_CLAP.id, SPELLS.THUNDER_BLAST.id],
    primaryOverride: undefined as number | undefined,
    get primarySpell() {
      return this.spell[this.primaryOverride ?? 0];
    },
  };
  const abilities = {
    getAbility: vi.fn((spellId: number) => {
      if (spellId === SPELLS.THUNDER_CLAP.id || spellId === SPELLS.THUNDER_BLAST.id) {
        if (thunderClapAbility.primaryOverride === undefined) {
          thunderClapAbility.primaryOverride = thunderClapAbility.spell.findIndex(
            (id) => id === spellId,
          );
        }
        return thunderClapAbility;
      }

      return { spell: spellId, primarySpell: spellId };
    }),
    getExpectedCooldownDuration: vi.fn((spellId: number) => {
      if (spellId === SPELLS.SHIELD_SLAM.id) {
        return 9000;
      }
      if (spellId === SPELLS.THUNDER_CLAP.id) {
        return 4600;
      }

      return 0;
    }),
    getMaxCharges: vi.fn(() => 1),
  };
  const globalCooldown = {
    getGlobalCooldownDuration: vi.fn(() => 1500),
  };

  const spellUsable = parser.loadModule(
    SpellUsable,
    {
      eventEmitter,
      abilities,
      globalCooldown,
      priority: 0,
    },
    'spellUsable',
  ) as SpellUsable;

  const annotations: Annotation[] = [];
  (
    spellUsable as unknown as {
      addDebugAnnotation: (event: AnyEvent, annotation: Annotation) => void;
    }
  ).addDebugAnnotation = vi.fn((_event, annotation) => {
    annotations.push(annotation);
  });

  const triggerCast = (timestamp: number, spellId: number) => {
    parser.currentTimestamp = timestamp;
    eventEmitter.triggerEvent(makeCast(timestamp, spellId));
  };

  const triggerApplyBuff = (timestamp: number, spellId: number) => {
    parser.currentTimestamp = timestamp;
    eventEmitter.triggerEvent(makeApplyBuff(timestamp, spellId));
  };

  return { spellUsable, triggerApplyBuff, triggerCast, annotations };
}

function hasCooldownError(annotations: Annotation[]): boolean {
  return annotations.some((annotation) =>
    annotation.summary.includes(
      "was used while SpellUsable's tracker thought it had no available charges",
    ),
  );
}

describe('Protection Warrior SpellUsable', () => {
  it('uses a valid reset trigger before reporting an early Shield Slam cast', () => {
    const { triggerCast, annotations } = makeSpellUsable();

    triggerCast(0, SPELLS.SHIELD_SLAM.id);
    triggerCast(3000, SPELLS.REVENGE.id);
    triggerCast(5000, SPELLS.SHIELD_SLAM.id);

    expect(hasCooldownError(annotations)).toBe(false);
  });

  it('still reports an early Shield Slam cast without a valid reset trigger', () => {
    const { triggerCast, annotations } = makeSpellUsable();

    triggerCast(0, SPELLS.SHIELD_SLAM.id);
    triggerCast(5000, SPELLS.SHIELD_SLAM.id);

    expect(hasCooldownError(annotations)).toBe(true);
  });

  it('does not fabricate inferred Shield Slam resets after the Shield Slam cast', () => {
    const { spellUsable, triggerCast } = makeSpellUsable();

    triggerCast(0, SPELLS.SHIELD_SLAM.id);
    triggerCast(4900, SPELLS.REVENGE.id);
    triggerCast(5000, SPELLS.SHIELD_SLAM.id);

    const endCooldown = spellUsable
      .history(SPELLS.SHIELD_SLAM.id)
      .data.find((event) => event.updateType === UpdateSpellUsableType.EndCooldown);

    expect(endCooldown?.timestamp).toBe(5000);
  });

  it('allows small Thunder Clap timestamp drift from haste-scaled cooldowns', () => {
    const { triggerCast, annotations } = makeSpellUsable();

    triggerCast(0, SPELLS.THUNDER_CLAP.id);
    triggerCast(4400, SPELLS.THUNDER_CLAP.id);

    expect(hasCooldownError(annotations)).toBe(false);
  });

  it('uses Shield Slam buff applications as explicit reset signals', () => {
    const { annotations, triggerApplyBuff, triggerCast } = makeSpellUsable();

    triggerCast(0, SPELLS.SHIELD_SLAM.id);
    triggerApplyBuff(3000, SPELLS.SHIELD_SLAM_RESET_BUFF.id);
    triggerCast(5000, SPELLS.SHIELD_SLAM.id);

    expect(hasCooldownError(annotations)).toBe(false);
  });
});
