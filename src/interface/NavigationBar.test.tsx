import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { reset, setReport } from 'interface/reducers/navigation';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from 'store';

import NavigationBar from './NavigationBar';

describe('NavigationBar', () => {
  beforeAll(() => {
    i18n.load('en', {});
    i18n.activate('en');
  });

  afterEach(() => store.dispatch(reset()));

  it('routes both the logo and report title to the landing page', () => {
    store.dispatch(setReport({ link: '/local/report-id', title: 'Local combat log' }));

    render(
      <Provider store={store}>
        <I18nProvider i18n={i18n}>
          <MemoryRouter initialEntries={['/local/report-id']}>
            <NavigationBar />
          </MemoryRouter>
        </I18nProvider>
      </Provider>,
    );

    expect(screen.getByRole('link', { name: 'WoWAnalyzer home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Local combat log' })).toHaveAttribute('href', '/');
  });
});
