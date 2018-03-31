import SPELLS from 'common/SPELLS';
import {
  thisPlayer,
  DamagingEvent1,
  DamagingEvent2,
  DamagingEvent3,
  AtonementOnSelf1,
  AtonementOnSelf2,
  AtonementOnPlayer1,
  AtonementOnPlayer2,
  AtonementOnPlayer3,
} from 'tests/Parser/Priest/Discipline/Fixtures/TestingEvents';

import AtonementSuccessiveDamage from './AtonementSuccessiveDamage';

describe('DisciplinePriest.Reordering', () => {

  let atonementSuccessiveDamageNormalizer;
  beforeEach(() => {
    atonementSuccessiveDamageNormalizer = new AtonementSuccessiveDamage({
      reorder: () => true,
      toPlayer: () => true,
      byPlayer: () => true,
      toPlayerPet: () => false,
      byPlayerPet: () => false,
      playerId: thisPlayer,
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

    let result = atonementSuccessiveDamageNormalizer.normalize(AtonementOf2DamingEventsGroupedTogether);
    expect(result).toEqual([
      AtonementOnPlayer2,
      DamagingEvent1,
      AtonementOnPlayer1,
      AtonementOnPlayer2,
      DamagingEvent2,
      AtonementOnPlayer1,
      AtonementOnPlayer2]);
  });

  it('If the atonement of 2 events is correct, it stays untouched', () => {

    const AtonementOf2DamingEventsGroupedTogether = [
      AtonementOnPlayer2,
      DamagingEvent1,
      AtonementOnPlayer1,
      AtonementOnPlayer2,
      DamagingEvent2,
      AtonementOnPlayer1,
      AtonementOnPlayer2
    ];

    let result = atonementSuccessiveDamageNormalizer.normalize(AtonementOf2DamingEventsGroupedTogether);
    expect(result).toEqual([
      AtonementOnPlayer2,
      DamagingEvent1,
      AtonementOnPlayer1,
      AtonementOnPlayer2,
      DamagingEvent2,
      AtonementOnPlayer1,
      AtonementOnPlayer2]);
  });

  it('If the 2 damaging blocks scenario happens twice, both are corrected', () => {

    const AtonementOf2DamingEventsGroupedTogether = [
      AtonementOnPlayer2,
      DamagingEvent1,
      DamagingEvent2,
      AtonementOnPlayer1,
      AtonementOnPlayer2,
      AtonementOnPlayer1,
      AtonementOnPlayer2,
      DamagingEvent1,
      DamagingEvent2,
      AtonementOnPlayer1,
      AtonementOnPlayer2,
      AtonementOnPlayer1,
      AtonementOnPlayer2
    ];

    let result = atonementSuccessiveDamageNormalizer.normalize(AtonementOf2DamingEventsGroupedTogether);
    expect(result).toEqual([
      AtonementOnPlayer2,
      DamagingEvent1,
      AtonementOnPlayer1,
      AtonementOnPlayer2,
      DamagingEvent2,
      AtonementOnPlayer1,
      AtonementOnPlayer2,
      DamagingEvent1,
      AtonementOnPlayer1,
      AtonementOnPlayer2,
      DamagingEvent2,
      AtonementOnPlayer1,
      AtonementOnPlayer2
    ]);
  });
});
