import renderer from 'react-test-renderer';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from 'store';

import { ConditionDescription } from './annotate';
import { buffPresent } from './conditions';
import { InternalRule, TargetType } from './index';

describe('ConditionDescription', () => {
  it('should return no description for unconditional rules', () => {
    const content = renderer
      .create(
        <ReduxProvider store={store}>
          <ConditionDescription
            rule={{ spell: { type: TargetType.Spell, target: { id: 1, name: 'Test', icon: '' } } }}
          />
        </ReduxProvider>,
      )
      .toJSON();
    expect(content).toBeNull();
  });

  it('should return a description for a rule with a condition', () => {
    const rule: InternalRule = {
      spell: { type: TargetType.Spell, target: { id: 1, name: 'Test', icon: '' } },
      condition: buffPresent({ id: 2, name: 'Buff', icon: '' }),
    };

    const content = renderer
      .create(
        <ReduxProvider store={store}>
          <ConditionDescription rule={rule} />
        </ReduxProvider>,
      )
      .toJSON();

    expect(content).toMatchSnapshot();
  });
});
