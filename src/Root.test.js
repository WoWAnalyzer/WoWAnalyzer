import React from 'react';
import { mount } from 'enzyme';
import Root from './Root';

describe('Root', () => {
  it('renders without crashing', () => {
    // I don't think this helps us more than `mount()`
    // const div = document.createElement('div');
    // ReactDOM.render(<Root />, div);

    // At least the code input field should be visible
    const tree = mount(
      <Root />
    );
    expect(tree.find('input[name="code"]').exists()).toBe(true);
  });
});
