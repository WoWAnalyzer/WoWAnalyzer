import { toJson } from './fetchWclApi';

describe('toJson', () => {
  test('parses regular JSON no problem', async () => {
    expect(await toJson(`{}`)).toEqual({});
    expect(await toJson(`{"guid":1337,"name":"My Awesome Spell","ability_icon":"some_icon"}`)).toEqual({
      guid: 1337,
      name: 'My Awesome Spell',
      // eslint-disable-next-line @typescript-eslint/camelcase
      ability_icon: 'some_icon',
    });
  });
  test('fixes JSON with broken spell names', async () => {
    // This is a common WCL bug. It doesn't escape quotes for spells with quotes in them when using `translate=true` (so it's being translated)
    expect(await toJson(`{"guid":1337,"name":"My Awesome "Spell"","ability_icon":"some_icon"}`)).toEqual({
      guid: 1337,
      name: 'My Awesome "Spell"',
      // eslint-disable-next-line @typescript-eslint/camelcase
      ability_icon: 'some_icon',
    });
    expect(await toJson(`{"guid":1337,"name": "My Awesome "Spell"","ability_icon":"some_icon"}`)).toEqual({
      guid: 1337,
      name: 'My Awesome "Spell"',
      // eslint-disable-next-line @typescript-eslint/camelcase
      ability_icon: 'some_icon',
    });
  });
});
