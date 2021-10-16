import React from 'react';
import renderer from 'react-test-renderer';

import { ConditionDescription } from './annotate';
import { buffPresent } from './buffPresent';

describe('ConditionDescription', () => {
  it('should return no description for unconditional rules', () => {
    const content = renderer
      .create(<ConditionDescription rule={{ id: 1, name: 'Test', icon: '' }} />)
      .toJSON();
    expect(content).toBeNull();
  });

  it('should return a description for a rule with a condition', () => {
    const rule = {
      spell: { id: 1, name: 'Test', icon: '' },
      condition: buffPresent({ id: 2, name: 'Buff', icon: '' }),
    };

    const content = renderer.create(<ConditionDescription rule={rule} />).toJSON();

    expect(content).toMatchSnapshot();
  });
});
