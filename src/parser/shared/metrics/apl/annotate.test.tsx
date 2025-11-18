import { act, render } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from 'store';

import { ConditionDescription } from './annotate';
import { buffPresent } from './conditions';
import { InternalRule, TargetType } from './index';

describe('ConditionDescription', () => {
  it('should return no description for unconditional rules', () => {
    act(() => {
      const { container } = render(
        <ReduxProvider store={store}>
          <ConditionDescription
            rule={{ spell: { type: TargetType.Spell, target: { id: 1, name: 'Test', icon: '' } } }}
          />
        </ReduxProvider>,
      );
      expect(container).toBeEmptyDOMElement();
    });
  });

  it('should return a description for a rule with a condition', () => {
    const rule: InternalRule = {
      spell: { type: TargetType.Spell, target: { id: 1, name: 'Test', icon: '' } },
      condition: buffPresent({ id: 2, name: 'Buff', icon: '' }),
    };

    act(() => {
      const { container } = render(
        <ReduxProvider store={store}>
          <ConditionDescription rule={rule} />
        </ReduxProvider>,
      );

      expect(container).toMatchSnapshot();
    });
  });
});
