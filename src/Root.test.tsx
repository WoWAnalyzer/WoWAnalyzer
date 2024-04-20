import { render, screen, waitFor } from '@testing-library/react';

import Root from './Root';
jest.unmock('react-router-dom');

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    // Add mock for window.scrollTo so that ScrollRestoration can be rendered
    vi.stubGlobal('scrollTo', vi.fn());

    render(<Root />);

    // At least the code input field should be visible
    await waitFor(() => screen.getByRole('textbox'));
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'code');
  });
});
