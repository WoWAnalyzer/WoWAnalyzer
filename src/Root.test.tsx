import { mount } from 'enzyme';
import React from 'react';

import Root from './Root';

jest.unmock('react-router-dom');

describe('Root', () => {
  const tree = mount(<Root />);
  it('renders without crashing', () => {
    // At least the code input field should be visible
    expect(tree.find('input[name="code"]').exists()).toBe(true);
  });
});
