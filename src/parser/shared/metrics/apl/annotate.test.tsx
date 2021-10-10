import React from 'react';
import renderer from 'react-test-renderer';

import { RuleDescription } from './annotate';
import { buffPresent } from './buffPresent';

describe('RuleDescription', () => {
  it('should return no description for unconditional rules', () => {
    const content = renderer
      .create(<RuleDescription rule={{ id: 1, name: 'Test', icon: '' }} />)
      .toJSON();
    expect(content).toBeNull();
  });

  it('should return a description for a rule with a condition', () => {
    const rule = {
      spell: { id: 1, name: 'Test', icon: '' },
      condition: buffPresent({ id: 2, name: 'Buff', icon: '' }),
    };

    const content = renderer.create(<RuleDescription rule={rule} />).toJSON();

    expect(content).toMatchSnapshot();
  });
});
