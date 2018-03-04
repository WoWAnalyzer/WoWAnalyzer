import React from 'react';
import { shallow } from 'enzyme';

import ReadableList from './ReadableList';

const Dummy = () => <div />;

describe('ReadableList', () => {
  it('doesn\'t mutate a single item', () => {
    expect(shallow(<ReadableList><Dummy /></ReadableList>)).toMatchSnapshot();
  });
  it('merges two items with an "and"', () => {
    expect(shallow(<ReadableList><Dummy /><Dummy /></ReadableList>)).toMatchSnapshot();
  });
  it('merges three items with a "," and an "and"', () => {
    expect(shallow(<ReadableList><Dummy /><Dummy /><Dummy /></ReadableList>)).toMatchSnapshot();
  });
  it('merges four items with two "," and an "and"', () => {
    expect(shallow(<ReadableList><Dummy /><Dummy /><Dummy /><Dummy /></ReadableList>)).toMatchSnapshot();
  });
});
