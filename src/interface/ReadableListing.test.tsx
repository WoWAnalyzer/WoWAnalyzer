import renderer from 'react-test-renderer';

import ReadableListing from './ReadableListing';

const Dummy = () => <div />;

describe('ReadableList', () => {
  it("doesn't mutate a single item", () => {
    expect(
      renderer
        .create(
          <ReadableListing>
            <Dummy />
          </ReadableListing>,
        )
        .toJSON(),
    ).toMatchSnapshot();
  });
  it('merges two items with an "and"', () => {
    expect(
      renderer
        .create(
          <ReadableListing>
            <Dummy />
            <Dummy />
          </ReadableListing>,
        )
        .toJSON(),
    ).toMatchSnapshot();
  });
  it('merges three items with a "," and an "and"', () => {
    expect(
      renderer
        .create(
          <ReadableListing>
            <Dummy />
            <Dummy />
            <Dummy />
          </ReadableListing>,
        )
        .toJSON(),
    ).toMatchSnapshot();
  });
  it('merges four items with two "," and an "and"', () => {
    expect(
      renderer
        .create(
          <ReadableListing>
            <Dummy />
            <Dummy />
            <Dummy />
            <Dummy />
          </ReadableListing>,
        )
        .toJSON(),
    ).toMatchSnapshot();
  });
});
