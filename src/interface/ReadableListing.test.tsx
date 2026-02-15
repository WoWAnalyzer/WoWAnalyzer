import { render } from '@testing-library/react';

import ReadableListing from './ReadableListing';

const Dummy = () => <div />;

describe('ReadableList', () => {
  it("doesn't mutate a single item", () => {
    expect(
      render(
        <ReadableListing>
          <Dummy />
        </ReadableListing>,
      ).container,
    ).toMatchSnapshot();
  });
  it('merges two items with an "and"', () => {
    expect(
      render(
        <ReadableListing>
          <Dummy />
          <Dummy />
        </ReadableListing>,
      ).container,
    ).toMatchSnapshot();
  });
  it('merges three items with a "," and an "and"', () => {
    expect(
      render(
        <ReadableListing>
          <Dummy />
          <Dummy />
          <Dummy />
        </ReadableListing>,
      ).container,
    ).toMatchSnapshot();
  });
  it('merges four items with two "," and an "and"', () => {
    expect(
      render(
        <ReadableListing>
          <Dummy />
          <Dummy />
          <Dummy />
          <Dummy />
        </ReadableListing>,
      ).container,
    ).toMatchSnapshot();
  });
});
