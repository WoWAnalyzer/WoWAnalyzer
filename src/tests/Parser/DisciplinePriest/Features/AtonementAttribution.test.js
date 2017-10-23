import AtonementAttribution from 'Parser/DisciplinePriest/Modules/Features/AtonementAttribution';
import SPELLS from 'common/SPELLS';
import processEvents from '../Fixtures/processEvents';

import {
  DamagingEvent1,
  DamagingEvent2,
  AtonementOnSelf1,
  AtonementOnSelf2,
  AtonementOnPlayer1,
  AtonementOnPlayer2,
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

  it('The atonement on self between 2 damaging events is pushed down to be grouped with the other atonement events', () => {

    const TwoSuccesiveDamagingEventsWithAtonementOnSelfBetween = [
      AtonementOnPlayer2,
      DamagingEvent1,
      AtonementOnSelf1,
      DamagingEvent2,
      AtonementOnPlayer1
    ];

    let result = atonementAtribution.reorderEvents(TwoSuccesiveDamagingEventsWithAtonementOnSelfBetween);
    console.log(result);
    expect(result[2]).toBe(AtonementOnSelf1);
  });

  it('If Atonement on self happens after the damaging events, the order isnt changed', () => {

    const CorrectOrder = [
      DamagingEvent1,
      DamagingEvent2,
      AtonementOnPlayer1,
      AtonementOnPlayer2
    ];

    let result = atonementAtribution.reorderEvents(CorrectOrder);
    console.log(result);
    expect(result[2]).toBe(AtonementOnPlayer1);
    expect(result[3]).toBe(AtonementOnPlayer2);
  });

  it('If an atonement between 2 damaging events occur twice, both events are corrected', () => {

    const AtonementBetweenDamageEventsOccurTwice = [
      AtonementOnPlayer2,
      DamagingEvent1,
      AtonementOnSelf1,
      DamagingEvent2,
      AtonementOnPlayer1,
      AtonementOnPlayer2,
      DamagingEvent1,
      AtonementOnSelf1,
      DamagingEvent2,
      AtonementOnPlayer1,
      AtonementOnPlayer2
    ];

    let result = atonementAtribution.reorderEvents(AtonementBetweenDamageEventsOccurTwice);
    expect(result[2]).toBe(DamagingEvent2);
    expect(result[3]).toBe(AtonementOnSelf1);
    expect(result[7]).toBe(DamagingEvent2);
    expect(result[8]).toBe(AtonementOnSelf1);
  });

  it('If 2 damaging events happen simultaneously, the atonement ahead is split in two', () => {

    const AtonementOf2DamingEventsGroupedTogether = [
      AtonementOnPlayer2,
      DamagingEvent1,
      DamagingEvent2,
      AtonementOnPlayer1,
      AtonementOnPlayer2,
      AtonementOnPlayer1,
      AtonementOnPlayer2,
      DamagingEvent1,
    ];

    let result = atonementAtribution.reorderEvents(AtonementOf2DamingEventsGroupedTogether);
    console.log(result);
    expect(result[4]).toBe(DamagingEvent2);

  });

});
