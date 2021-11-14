import { insertEvents } from 'parser/core/insertEvents';

function fakeEvent(timestamp, abilityId) {
  return {
    ability: { guid: abilityId },
    timestamp,
  };
}

function fakeFabEvent(timestamp, abilityId) {
  return {
    ability: { guid: abilityId },
    timestamp,
    __fabricated: true,
  };
}

const origEvents = [
  fakeEvent(0, 5),
  fakeEvent(100, 4),
  fakeEvent(200, 3),
  fakeEvent(300, 2),
  fakeEvent(400, 1),
];

describe('insertEvents', () => {
  test('insert nothing', () => {
    expect(insertEvents(origEvents, [])).toEqual(origEvents);
  });
  test('insert one middle', () => {
    expect(insertEvents(origEvents, [fakeEvent(150, 10)])).toEqual([
      fakeEvent(0, 5),
      fakeEvent(100, 4),
      fakeFabEvent(150, 10),
      fakeEvent(200, 3),
      fakeEvent(300, 2),
      fakeEvent(400, 1),
    ]);
  });
  test('insert one start', () => {
    expect(insertEvents(origEvents, [fakeEvent(-100, 10)])).toEqual([
      fakeFabEvent(-100, 10),
      fakeEvent(0, 5),
      fakeEvent(100, 4),
      fakeEvent(200, 3),
      fakeEvent(300, 2),
      fakeEvent(400, 1),
    ]);
  });
  test('insert one end', () => {
    expect(insertEvents(origEvents, [fakeEvent(500, 10)])).toEqual([
      fakeEvent(0, 5),
      fakeEvent(100, 4),
      fakeEvent(200, 3),
      fakeEvent(300, 2),
      fakeEvent(400, 1),
      fakeFabEvent(500, 10),
    ]);
  });
  test('insert one tie', () => {
    expect(insertEvents(origEvents, [fakeEvent(200, 10)])).toEqual([
      fakeEvent(0, 5),
      fakeEvent(100, 4),
      fakeEvent(200, 3),
      fakeFabEvent(200, 10),
      fakeEvent(300, 2),
      fakeEvent(400, 1),
    ]);
  });
  test('insert many', () => {
    expect(
      insertEvents(origEvents, [
        fakeEvent(400, 10),
        fakeEvent(0, 11),
        fakeEvent(200, 12),
        fakeEvent(0, 13),
        fakeEvent(350, 14),
      ]),
    ).toEqual([
      fakeEvent(0, 5),
      fakeFabEvent(0, 11),
      fakeFabEvent(0, 13),
      fakeEvent(100, 4),
      fakeEvent(200, 3),
      fakeFabEvent(200, 12),
      fakeEvent(300, 2),
      fakeFabEvent(350, 14),
      fakeEvent(400, 1),
      fakeFabEvent(400, 10),
    ]);
  });
});
