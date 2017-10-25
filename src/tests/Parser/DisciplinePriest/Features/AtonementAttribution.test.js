import AtonementAttribution from 'Parser/DisciplinePriest/Modules/Features/AtonementAttribution';
import SPELLS from 'common/SPELLS';
import processEvents from '../Fixtures/processEvents';

import {
  DamagingEvent1,
  DamagingEvent2,
  DamagingEvent3,
  AtonementOnSelf1,
  AtonementOnSelf2,
  AtonementOnPlayer1,
  AtonementOnPlayer2,
  AtonementOnPlayer3,
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

  it('If 2 damaging events happen simultaneously, the atonement ahead is split in two', () => {

    const AtonementOf2DamingEventsGroupedTogether = [
      AtonementOnPlayer2,
      DamagingEvent1,
      DamagingEvent2,
      AtonementOnPlayer1,
      AtonementOnPlayer2,
      AtonementOnPlayer1,
      AtonementOnPlayer2
    ];

    let result = atonementAtribution.reorderEvents(AtonementOf2DamingEventsGroupedTogether);
    expect(result[0]).toBe(AtonementOnPlayer2)
    expect(result[1]).toBe(DamagingEvent1)
    expect(result[2]).toBe(AtonementOnPlayer1)
    expect(result[3]).toBe(AtonementOnPlayer2)
    expect(result[4]).toBe(DamagingEvent2)
    expect(result[5]).toBe(AtonementOnPlayer1)
    expect(result[6]).toBe(AtonementOnPlayer2);
  });

});
