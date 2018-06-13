import truth from './truth';

describe('does it work without a regular import?', () => {
  it('works', () => {
    expect(truth).toBe(true);
  });
});
