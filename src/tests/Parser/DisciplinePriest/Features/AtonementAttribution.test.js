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

  it('The atonement on self between 2 damaging events is pushed down to be grouped with the other atonement events', () => {

    const TwoSuccesiveDamagingEventsWithAtonementOnSelfBetween = [
      AtonementOnPlayer2,
      DamagingEvent1,
      AtonementOnSelf1,
      DamagingEvent2,
      AtonementOnPlayer1,
      AtonementOnPlayer2,
      DamagingEvent1
    ];

    let result = atonementAtribution._reorderAtonementEventsBetweenDamagingEvents(TwoSuccesiveDamagingEventsWithAtonementOnSelfBetween);
    expect(result[2]).toBe(DamagingEvent2);
    expect(result[3]).toBe(AtonementOnSelf1);
  });

  it('If Atonement on self happens after the damaging events, the order isnt changed', () => {

    const CorrectOrder = [
      DamagingEvent1,
      DamagingEvent2,
      AtonementOnPlayer1,
      AtonementOnPlayer2
    ];

    let result = atonementAtribution._reorderAtonementEventsBetweenDamagingEvents(CorrectOrder);
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

    let result = atonementAtribution._reorderAtonementEventsBetweenDamagingEvents(AtonementBetweenDamageEventsOccurTwice);
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
      AtonementOnPlayer2
    ];

    let result = atonementAtribution._reorderAtonementEventsFromSuccesiveDamagingEvents(AtonementOf2DamingEventsGroupedTogether);
    expect(result[4]).toBe(DamagingEvent2);
  });

});
