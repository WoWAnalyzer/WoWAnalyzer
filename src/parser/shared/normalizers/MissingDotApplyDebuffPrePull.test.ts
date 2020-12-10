import SPELLS from 'common/SPELLS';
import { AnyEvent, EventType } from 'parser/core/Events';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';


import MissingDotApplyDebuffPrePull, { Dot } from "parser/shared/normalizers/MissingDotApplyDebuffPrePull";

const DOTS = [
  {
    debuffId: SPELLS.AGONY.id,
  },
]

class TestMissingDotApplyDebuffPrePull extends MissingDotApplyDebuffPrePull {
  static dots: Dot[] = DOTS;
}


describe('core/Modules/Normalizers/MissingDotApplyDebuffPrePull', () => {
  let parser: TestCombatLogParser;

  beforeEach(() => {
    parser = new TestCombatLogParser();
    parser.loadModule(TestMissingDotApplyDebuffPrePull, { priority: 0 });
  });

  it('fabricates an apply debuff event when a dot damage event is found before any apply debuff event', () => {

    const events: AnyEvent[] = [
      { timestamp: 1000, type: EventType.Damage, sourceID:1, sourceIsFriendly:true, targetID:2, targetIsFriendly:false, ability: { name: SPELLS.AGONY.name, guid: SPELLS.AGONY.id, type:32, abilityIcon: SPELLS.AGONY.icon }, hitType:1, amount:486, unmitigatedAmount:486, tick:true, resourceActor:2, spellPower: 0, targetInstance: 0}
    ];

    const result = parser.normalize(events);
    console.log("result");
    console.log(result);

    // Should be 1) apply debuff (fabricated), 2) Damage, 3) Fightend (fabricated)
    expect(result.length).toBe(3);

    expect(result[0]).toStrictEqual({
      type: EventType.ApplyDebuff,
      ability: { name: SPELLS.AGONY.name, guid: SPELLS.AGONY.id, type:32, abilityIcon: SPELLS.AGONY.icon },
      sourceID: 1,
      sourceIsFriendly: true,
      targetID: 2,
      targetIsFriendly: false,
      timestamp: 0,

      // Custom properties:
      __fabricated: true,
    });
  });

  it('doesn\'t fabricate an apply debuff event when one already exists', () => {

    const events: AnyEvent[] = [
      { timestamp: 50, type: EventType.ApplyDebuff, sourceID:1, sourceIsFriendly:true, targetID:2, targetIsFriendly:false, ability: { name: SPELLS.UNSTABLE_AFFLICTION.name, guid: SPELLS.UNSTABLE_AFFLICTION.id, type:32, abilityIcon: SPELLS.UNSTABLE_AFFLICTION.icon }, targetInstance: 0},
      { timestamp: 1000, type: EventType.Damage, sourceID:1, sourceIsFriendly:true, targetID:2, targetIsFriendly:false, ability: { name: SPELLS.UNSTABLE_AFFLICTION.name, guid: SPELLS.UNSTABLE_AFFLICTION.id, type:32, abilityIcon: SPELLS.UNSTABLE_AFFLICTION.icon }, hitType:1, amount:486, unmitigatedAmount:486, tick:true, resourceActor:2, spellPower: 0, targetInstance: 0}
    ];

    const result = parser.normalize(events);

    expect(result).toStrictEqual(events); // No-op
  });
});
