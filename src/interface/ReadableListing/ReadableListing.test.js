import React from 'react';
import { shallow } from 'enzyme';

import ReadableListing from './ReadableListing';

const Dummy = () => <div />;

describe('ReadableList', () => {
  it('doesn\'t mutate a single item', () => {
    expect(shallow(<ReadableListing><Dummy /></ReadableListing>)).toMatchSnapshot();
  });
  it('merges two items with an "and"', () => {
    expect(shallow(<ReadableListing><Dummy /><Dummy /></ReadableListing>)).toMatchSnapshot();
  });
  it('merges three items with a "," and an "and"', () => {
    expect(shallow(<ReadableListing><Dummy /><Dummy /><Dummy /></ReadableListing>)).toMatchSnapshot();
  });
  it('merges four items with two "," and an "and"', () => {
    expect(shallow(<ReadableListing><Dummy /><Dummy /><Dummy /><Dummy /></ReadableListing>)).toMatchSnapshot();
  });
});
