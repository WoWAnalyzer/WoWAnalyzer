import { render } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';

import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Tense } from 'parser/shared/metrics/apl';
import { store } from 'store';

import hasResource from './hasResource';

describe('hasResource', () => {
  it('uses event units for validation and player-facing units in its description', () => {
    const condition = hasResource(
      RESOURCE_TYPES.RUNIC_POWER,
      { atLeast: 600 },
      { displayScaleFactor: 0.1 },
    );

    expect(
      condition.validate(
        { current: 600, previous: 0 },
        {} as never,
        { id: 1, name: 'Test', icon: '' },
        [],
      ),
    ).toBe(true);
    expect(
      condition.validate(
        { current: 599, previous: 0 },
        {} as never,
        { id: 1, name: 'Test', icon: '' },
        [],
      ),
    ).toBe(false);

    const { container } = render(
      <ReduxProvider store={store}>{condition.describe(Tense.Present)}</ReduxProvider>,
    );

    expect(container).toHaveTextContent('you have at least 60 Runic Power');
    expect(container).not.toHaveTextContent('600');
  });

  it('marks the resource icon as decorative when its name is also shown', () => {
    const condition = hasResource(RESOURCE_TYPES.RUNIC_POWER, { atLeast: 60 });
    const { container } = render(
      <ReduxProvider store={store}>{condition.describe()}</ReduxProvider>,
    );

    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });
});
