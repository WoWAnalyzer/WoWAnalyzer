import AtonementAttribution from 'Parser/DisciplinePriest/Modules/Features/AtonementAttribution';
import SPELLS from 'common/SPELLS';
import processEvents from '../Fixtures/processEvents';

import {
  TwoSuccesiveDamagingEventsWithAtonementOnSelfBetween,
  TwoSuccesiveDamagingEvents
} from '../Fixtures/ReorderingScenarios';

describe('DisciplinePriest.Reordering', () => {

  let atonementAtribution;
  beforeEach(() => {
    atonementAtribution = new AtonementAttribution({
      reorder: () => true,
      toPlayer: () => true,
      byPlayer: () => true,
      toPlayerPet: () => false,
      byPlayerPet: () => false,
    });
  });

  it('Two Succesive Damaging Events with atonement on self between', () => {
    let result = atonementAtribution.reorderEvents(TwoSuccesiveDamagingEventsWithAtonementOnSelfBetween);
    expect(result[2].type).toBe("damage");
    expect(result[3].type).toBe("heal");
    expect(result[3].targetID).toBe(result[3].sourceID);
  });

  it('Two Succesive Damaging Events', () => {
    let result = atonementAtribution.reorderEvents(TwoSuccesiveDamagingEvents);
    console.log(result);
  });

});
