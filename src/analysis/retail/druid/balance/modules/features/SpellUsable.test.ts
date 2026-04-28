import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';
import {
  DEFAULT_CONFIG,
  DEFAULT_FIGHT,
  DEFAULT_PLAYER_INFO,
  DEFAULT_REPORT,
} from 'parser/core/tests/constants';
import { Buff, CastEvent, CombatantInfoEvent, EventType, Item } from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import SpellUsable from './SpellUsable';
import { Talent } from 'common/TALENTS/types';
import Abilities from 'analysis/retail/druid/balance/modules/Abilities';
import Haste from 'parser/shared/modules/Haste';
import StatTracker from 'parser/shared/modules/StatTracker';
import TestCombatant from 'parser/core/tests/TestCombatant';
import CombatLogParser from 'parser/core/CombatLogParser';
import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';

const FORCE_OF_NATURE_CD = 60_000;
const CELESTIAL_ALIGNMENT_CD = 180_000;
const INCARNATION_CHOSEN_OF_ELUNE_CD = 180_000;
const WHIRLING_STARS_CD_REDUCTION = 60_000;
const ORBITAL_STRIKE_CD_REDUCTION = 60_000;
const CONVOKE_THE_SPIRITS_CD = 120_000;
// Control of the Dream caps CD reduction at 15s
const CD_REDUCTION_CAP = 15_000;

const DEFAULT_COMBATANT_INFO = {
  gear: [] as Item[],
  auras: [] as Buff[],
} as CombatantInfoEvent;

describe('Balance Druid SpellUsable', () => {
  let parser: TestCombatLogParser;
  let module: SpellUsable;
  let eventEmitter: EventEmitter;
  let statTracker: StatTracker;
  let haste: Haste;
  let abilities: Abilities;

  describe('Module activation', () => {
    it('should be inactive without Control of the Dream talent', () => {
      // Arrange
      // Without Control of the Dream
      InitializeWithTalents([TALENTS_DRUID.FORCE_OF_NATURE_TALENT]);
      const events = [castEvent(TALENTS_DRUID.FORCE_OF_NATURE_TALENT, 0)];

      // Act
      parser.processEvents(events);

      // Assert
      // Without Control of the Dream, should get full 60s cooldown (no reduction)
      expect(module.isOnCooldown(TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id)).toBe(true);
      expect(module.cooldownRemaining(TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id)).toBe(
        FORCE_OF_NATURE_CD,
      );
    });
  });

  describe('First cast (pre-pull scenario)', () => {
    beforeEach(() => {
      InitializeWithTalents([
        TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT,
        TALENTS_DRUID.FORCE_OF_NATURE_TALENT,
        TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT,
        TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT,
      ]);
    });

    it('should apply 15s reduction to first Force of Nature cast', () => {
      // Arrange
      const events = [castEvent(TALENTS_DRUID.FORCE_OF_NATURE_TALENT, 0)];

      // Act
      events.forEach((event) => {
        parser.currentTimestamp = event.timestamp;
        eventEmitter.triggerEvent(event);
      });

      // Assert
      expect(module.isOnCooldown(TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id)).toBe(true);
      expect(module.cooldownRemaining(TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id)).toBe(
        FORCE_OF_NATURE_CD - CD_REDUCTION_CAP,
      );
    });

    it('should apply 15s reduction to first Celestial Alignment cast', () => {
      // Arrange
      const events = [castEvent(SPELLS.CELESTIAL_ALIGNMENT, 0)];

      // Act
      events.forEach((event) => {
        parser.currentTimestamp = event.timestamp;
        eventEmitter.triggerEvent(event);
      });

      // Assert
      expect(module.isOnCooldown(SPELLS.CELESTIAL_ALIGNMENT.id)).toBe(true);
      expect(module.cooldownRemaining(SPELLS.CELESTIAL_ALIGNMENT.id)).toBe(
        CELESTIAL_ALIGNMENT_CD - CD_REDUCTION_CAP,
      );
    });

    it('should apply 15s reduction to first Convoke the Spirits cast', () => {
      // Arrange
      const events = [castEvent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT, 0)];

      // Act
      events.forEach((event) => {
        parser.currentTimestamp = event.timestamp;
        eventEmitter.triggerEvent(event);
      });

      // Assert
      expect(module.isOnCooldown(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT.id)).toBe(true);
      expect(module.cooldownRemaining(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT.id)).toBe(
        CONVOKE_THE_SPIRITS_CD - CD_REDUCTION_CAP,
      );
    });
  });

  describe('Sequential casts with time progression', () => {
    beforeEach(() => {
      InitializeWithTalents([
        TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT,
        TALENTS_DRUID.FORCE_OF_NATURE_TALENT,
      ]);
    });

    it('should reduce cooldown by 10s when cast 10s after becoming available', () => {
      // Arrange
      const events = [
        castEvent(TALENTS_DRUID.FORCE_OF_NATURE_TALENT, 0), // First at t=0s, CD reduced by 15s -> 45s
        castEvent(SPELLS.WRATH_MOONKIN, 46_000), // Need to add some casts to make sure the CD charge/cooldown recomputation is triggered
        castEvent(TALENTS_DRUID.FORCE_OF_NATURE_TALENT, 55_000), // Cast at t=55s (10s after available at t=45s)
      ];

      // Act
      events.forEach((event) => {
        parser.currentTimestamp = event.timestamp;
        eventEmitter.triggerEvent(event);
      });

      // Assert
      expect(module.cooldownRemaining(TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id)).toBe(
        FORCE_OF_NATURE_CD - 10_000,
      );
    });

    it('should cap reduction at 15s when cast more than 15s after becoming available', () => {
      // Arrange
      const events = [
        castEvent(TALENTS_DRUID.FORCE_OF_NATURE_TALENT, 0), // First at t=0s, CD reduced by 15s -> 45s
        castEvent(SPELLS.WRATH_MOONKIN, 46_000), // Need to add some casts to make sure the CD charge/cooldown recomputation is triggered
        castEvent(TALENTS_DRUID.FORCE_OF_NATURE_TALENT, 100_000), // Cast at t=100s (55s after available at t=45s)
      ];

      // Act
      events.forEach((event) => {
        parser.currentTimestamp = event.timestamp;
        eventEmitter.triggerEvent(event);
      });

      // Assert
      expect(module.cooldownRemaining(TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id)).toBe(
        FORCE_OF_NATURE_CD - CD_REDUCTION_CAP,
      );
    });

    it('should compound reductions across three casts', () => {
      // Arrange
      const events = [
        castEvent(TALENTS_DRUID.FORCE_OF_NATURE_TALENT, 0), // First at t=0s, CD reduced by 15s -> 45s
        castEvent(SPELLS.WRATH_MOONKIN, 46_000), // Need to add some casts to make sure the CD charge/cooldown recomputation is triggered
        castEvent(TALENTS_DRUID.FORCE_OF_NATURE_TALENT, 55_000), // Cast at t=55s (10s after available at t=45s), CD reduced by 10s -> 50s
        castEvent(SPELLS.WRATH_MOONKIN, 106_000), // Need to add some casts to make sure the CD charge/cooldown recomputation is triggered
        castEvent(TALENTS_DRUID.FORCE_OF_NATURE_TALENT, 110_000), // Cast at t=110s (5s after available at t=105s), CD reduced by 5s -> 55s
      ];

      // Act
      events.forEach((event) => {
        parser.currentTimestamp = event.timestamp;
        eventEmitter.triggerEvent(event);
      });

      // Assert
      expect(module.cooldownRemaining(TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id)).toBe(
        FORCE_OF_NATURE_CD - 5_000,
      );
    });
  });

  describe('Multi-charge abilities (Whirling Stars talent)', () => {
    beforeEach(() => {
      InitializeWithTalents([
        TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT,
        TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT,
        TALENTS_DRUID.WHIRLING_STARS_TALENT,
      ]);
    });

    it('should reduce cooldown when using first charge (was at max charges before)', () => {
      // Arrange
      const events = [
        castEvent(SPELLS.CELESTIAL_ALIGNMENT, 0), // Use first charge at t=0s, CD reduced by 15s
      ];

      // Act
      events.forEach((event) => {
        parser.currentTimestamp = event.timestamp;
        eventEmitter.triggerEvent(event);
      });

      // Assert
      expect(module.chargesAvailable(SPELLS.CELESTIAL_ALIGNMENT.id)).toBe(1);
      expect(module.chargesOnCooldown(SPELLS.CELESTIAL_ALIGNMENT.id)).toBe(1);
      expect(module.cooldownRemaining(SPELLS.CELESTIAL_ALIGNMENT.id)).toBe(
        CELESTIAL_ALIGNMENT_CD - WHIRLING_STARS_CD_REDUCTION - CD_REDUCTION_CAP,
      );
    });

    it('should NOT reduce cooldown when was NOT at max charges before', () => {
      // Arrange
      const events = [
        castEvent(SPELLS.CELESTIAL_ALIGNMENT, 0), // Use first charge at t=0s, CD reduced by 15s
        castEvent(SPELLS.CELESTIAL_ALIGNMENT, 1_000), // Use second charge at t=1s, CD not reduced
      ];

      // Act
      events.forEach((event) => {
        parser.currentTimestamp = event.timestamp;
        eventEmitter.triggerEvent(event);
      });

      // Assert
      expect(module.chargesAvailable(SPELLS.CELESTIAL_ALIGNMENT.id)).toBe(0);
      expect(module.chargesOnCooldown(SPELLS.CELESTIAL_ALIGNMENT.id)).toBe(2);
      expect(module.cooldownRemaining(SPELLS.CELESTIAL_ALIGNMENT.id)).toBe(
        CELESTIAL_ALIGNMENT_CD - WHIRLING_STARS_CD_REDUCTION - CD_REDUCTION_CAP - 1_000,
      );
    });

    it('should track reductions when both charges are available again', () => {
      // Arrange
      const events = [
        castEvent(SPELLS.CELESTIAL_ALIGNMENT, 0), // Use first charge at t=0s, CD reduced by 15s -> 105s
        castEvent(SPELLS.CELESTIAL_ALIGNMENT, 1_000), // Use second charge at t=1s, CD not reduced -> (104s remaining)
        castEvent(SPELLS.WRATH_MOONKIN, 106_000), // Need to add some casts to make sure the CD charge/cooldown recomputation is triggered
        castEvent(SPELLS.CELESTIAL_ALIGNMENT, 114_000), // Use first charge that was restored at 105s, no reduction on current CD of second charge (111s remaining)
        castEvent(SPELLS.WRATH_MOONKIN, 226_000), // Need to add some casts to make sure the CD charge/cooldown recomputation is triggered
        castEvent(SPELLS.WRATH_MOONKIN, 346_000), // Need to add some casts to make sure the CD charge/cooldown recomputation is triggered
        castEvent(SPELLS.CELESTIAL_ALIGNMENT, 114_000 + 111_000 + 120_000 + 8_000), // Both charges have been restored, cast 8s after available -> 172s CD
      ];

      // Act
      events.forEach((event) => {
        parser.currentTimestamp = event.timestamp;
        eventEmitter.triggerEvent(event);
      });

      // Assert
      expect(module.cooldownRemaining(SPELLS.CELESTIAL_ALIGNMENT.id)).toBe(
        CELESTIAL_ALIGNMENT_CD - WHIRLING_STARS_CD_REDUCTION - 8_000,
      );
    });
  });

  describe('Mixed ability interactions', () => {
    beforeEach(() => {
      InitializeWithTalents([
        TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT,
        TALENTS_DRUID.FORCE_OF_NATURE_TALENT,
        TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT,
        TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT,
      ]);
    });

    it('should track each ability reduction independently', () => {
      // Arrange
      const events = [
        castEvent(TALENTS_DRUID.FORCE_OF_NATURE_TALENT, 0),
        castEvent(SPELLS.CELESTIAL_ALIGNMENT, 5_000),
        castEvent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT, 10_000),
      ];

      // Act
      events.forEach((event) => {
        parser.currentTimestamp = event.timestamp;
        eventEmitter.triggerEvent(event);
      });

      // Assert
      expect(module.cooldownRemaining(TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id)).toBe(
        FORCE_OF_NATURE_CD - CD_REDUCTION_CAP - 10_000,
      );
      expect(module.cooldownRemaining(SPELLS.CELESTIAL_ALIGNMENT.id)).toBe(
        CELESTIAL_ALIGNMENT_CD - CD_REDUCTION_CAP - (10_000 - 5_000),
      );
      expect(module.cooldownRemaining(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT.id)).toBe(
        CONVOKE_THE_SPIRITS_CD - CD_REDUCTION_CAP,
      );
    });

    it('should not affect other abilities when casting one', () => {
      // Arrange
      const events = [
        castEvent(TALENTS_DRUID.FORCE_OF_NATURE_TALENT, 0),
        castEvent(SPELLS.CELESTIAL_ALIGNMENT, 20_000),
        castEvent(SPELLS.WRATH_MOONKIN, 46_000), // Need to add some casts to make sure the CD charge/cooldown recomputation is triggered
        castEvent(TALENTS_DRUID.FORCE_OF_NATURE_TALENT, 55_000), // 10s after FoN available
      ];

      // Act
      events.forEach((event) => {
        parser.currentTimestamp = event.timestamp;
        eventEmitter.triggerEvent(event);
      });

      // Assert
      expect(module.cooldownRemaining(TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id)).toBe(
        FORCE_OF_NATURE_CD - 10_000,
      );
      expect(module.cooldownRemaining(SPELLS.CELESTIAL_ALIGNMENT.id)).toBe(
        CELESTIAL_ALIGNMENT_CD - CD_REDUCTION_CAP - (55_000 - 20_000),
      );
    });
  });

  describe('Every primary CD should be tracked', () => {
    it('should track Celestial Alignment', () => {
      // Arrange
      InitializeWithTalents([
        TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT,
        TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT,
      ]);

      const events = [castEvent(SPELLS.CELESTIAL_ALIGNMENT, 0)];

      // Act
      events.forEach((event) => {
        parser.currentTimestamp = event.timestamp;
        eventEmitter.triggerEvent(event);
      });

      // Assert
      expect(module.cooldownRemaining(SPELLS.CELESTIAL_ALIGNMENT.id)).toBe(
        CELESTIAL_ALIGNMENT_CD - CD_REDUCTION_CAP,
      );
    });

    it('should track Celestial Alignment with Orbital Strike', () => {
      // Arrange
      InitializeWithTalents([
        TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT,
        TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT,
        TALENTS_DRUID.ORBITAL_STRIKE_TALENT,
      ]);

      const events = [castEvent(SPELLS.CELESTIAL_ALIGNMENT_ORBITAL_STRIKE, 0)];

      // Act
      events.forEach((event) => {
        parser.currentTimestamp = event.timestamp;
        eventEmitter.triggerEvent(event);
      });

      // Assert
      expect(module.cooldownRemaining(SPELLS.CELESTIAL_ALIGNMENT_ORBITAL_STRIKE.id)).toBe(
        CELESTIAL_ALIGNMENT_CD - ORBITAL_STRIKE_CD_REDUCTION - CD_REDUCTION_CAP,
      );
    });

    it('should track Incarnation', () => {
      // Arrange
      InitializeWithTalents([
        TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT,
        TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT,
        TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT,
      ]);

      const events = [castEvent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE, 0)];

      // Act
      events.forEach((event) => {
        parser.currentTimestamp = event.timestamp;
        eventEmitter.triggerEvent(event);
      });

      // Assert
      expect(module.cooldownRemaining(SPELLS.INCARNATION_CHOSEN_OF_ELUNE.id)).toBe(
        INCARNATION_CHOSEN_OF_ELUNE_CD - CD_REDUCTION_CAP,
      );
    });

    it('should track Incarnation with Orbital Strike', () => {
      // Arrange
      InitializeWithTalents([
        TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT,
        TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT,
        TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT,
        TALENTS_DRUID.ORBITAL_STRIKE_TALENT,
      ]);

      const events = [castEvent(SPELLS.INCARNATION_ORBITAL_STRIKE, 0)];

      // Act
      events.forEach((event) => {
        parser.currentTimestamp = event.timestamp;
        eventEmitter.triggerEvent(event);
      });

      // Assert
      expect(module.cooldownRemaining(SPELLS.INCARNATION_ORBITAL_STRIKE.id)).toBe(
        INCARNATION_CHOSEN_OF_ELUNE_CD - ORBITAL_STRIKE_CD_REDUCTION - CD_REDUCTION_CAP,
      );
    });
  });

  function InitializeWithTalents(talents: Talent[]) {
    parser = new TestCombatLogParser(
      DEFAULT_CONFIG,
      DEFAULT_REPORT,
      DEFAULT_PLAYER_INFO,
      DEFAULT_FIGHT,
      DEFAULT_COMBATANT_INFO,
    );
    const combatant = new TestCombatantWithTalents(parser, talents);
    parser.selectedCombatant = combatant;

    // Use the real Balance Druid Abilities module
    // (thus instantiate all its transitive dependencies)
    eventEmitter = parser.getModule(EventEmitter);

    statTracker = parser.loadModule(StatTracker, {
      eventEmitter: eventEmitter,
      priority: 0,
    }) as StatTracker;

    haste = parser.loadModule(Haste, {
      eventEmitter: eventEmitter,
      statTracker: statTracker,
      priority: 0,
    }) as Haste;

    abilities = parser.loadModule(Abilities, { haste: haste, priority: 0 }) as Abilities;

    module = parser.loadModule(SpellUsable, {
      eventEmitter: eventEmitter,
      abilities: abilities,
      priority: 1,
    }) as SpellUsable;
  }

  // Event Factory
  function castEvent(
    spell: { id: number; name: string },
    timestamp: number,
    sourceId = 1,
  ): CastEvent {
    return {
      type: EventType.Cast,
      ability: { guid: spell.id, name: spell.name },
      sourceID: sourceId,
      sourceIsFriendly: true,
      targetID: 2,
      targetIsFriendly: false,
      timestamp,
    } as CastEvent;
  }

  // TestCombatant always returns true for every talent, we need to override this behavior
  class TestCombatantWithTalents extends TestCombatant {
    private talents: Talent[];

    constructor(parser: CombatLogParser, talents: Talent[]) {
      super(parser);
      this.talents = talents;
    }

    hasTalent(talent: Talent): boolean {
      return this.talents.includes(talent);
    }
  }
});
