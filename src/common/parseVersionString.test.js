import parseVersionString from './parseVersionString';

describe('ReadableList', () => {
  it('recognizes a full version string', () => {
    expect(parseVersionString('7.3.5')).toEqual({
      major: 7,
      minor: 3,
      patch: 5,
    });
  });
  it('recognizes a major patch', () => {
    expect(parseVersionString('7.2')).toEqual({
      major: 7,
      minor: 2,
    });
  });
});
