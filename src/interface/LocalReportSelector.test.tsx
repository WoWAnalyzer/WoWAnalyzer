import { fireEvent, render, screen } from '@testing-library/react';
import { i18n } from '@lingui/core';

const mocks = vi.hoisted(() => ({
  getReadyLocalReport: vi.fn(),
  importLocalCombatLog: vi.fn(),
  navigate: vi.fn(),
  recoverLocalReports: vi.fn(),
}));

vi.mock('local/LocalReportImport', () => ({
  importLocalCombatLog: mocks.importLocalCombatLog,
}));
vi.mock('local/localReportStore', () => ({
  getReadyLocalReport: mocks.getReadyLocalReport,
  recoverLocalReports: mocks.recoverLocalReports,
}));
vi.mock('./LocalReportManager', () => ({ default: () => null }));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => mocks.navigate,
}));

import LocalReportSelector from './LocalReportSelector';

const chooseFile = (container: HTMLElement, file = new File(['log'], 'combat.txt')) => {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
  return file;
};

describe('LocalReportSelector', () => {
  beforeAll(() => {
    i18n.load('en', {});
    i18n.activate('en');
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.recoverLocalReports.mockResolvedValue(undefined);
  });

  it('navigates a single-player target-dummy import directly to analysis', async () => {
    mocks.importLocalCombatLog.mockResolvedValue('local-id');
    mocks.getReadyLocalReport.mockResolvedValue({
      importKind: 'target-dummy',
      report: {
        locator: { kind: 'local', id: 'local-id' },
        fights: [
          {
            id: 1,
            boss: -1,
            name: 'Training Dummy',
            start_time: 0,
            end_time: 30_000,
            kill: false,
          },
        ],
        friendlies: [{ id: 7, name: 'Ada' }],
      },
      players: { 1: [{ id: 7, name: 'Ada' }] },
    });
    const { container } = render(<LocalReportSelector />);

    chooseFile(container);

    await vi.waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/local\/local-id\/1-.+\/7-Ada\/standard$/),
      ),
    );
  });

  it('keeps encounter imports on the existing report route', async () => {
    mocks.importLocalCombatLog.mockResolvedValue('encounter-id');
    mocks.getReadyLocalReport.mockResolvedValue({
      importKind: 'encounter-log',
      report: {
        locator: { kind: 'local', id: 'encounter-id' },
        fights: [{ id: 1 }, { id: 2 }],
      },
      players: {},
    });
    const { container } = render(<LocalReportSelector />);

    chooseFile(container);

    await vi.waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith('/local/encounter-id'));
  });

  it('cancels cleanly, offers retry, and lets the user start over', async () => {
    mocks.importLocalCombatLog.mockImplementation(
      (_file: File, _progress: unknown, signal: AbortSignal) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () =>
            reject(new DOMException('Import cancelled', 'AbortError')),
          );
        }),
    );
    const { container } = render(<LocalReportSelector />);
    const file = chooseFile(container);

    await screen.findByRole('button', { name: 'Cancel' });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await screen.findByText('Import cancelled. You can retry the same file.');

    fireEvent.click(screen.getByRole('button', { name: 'Retry this file' }));
    await vi.waitFor(() => expect(mocks.importLocalCombatLog).toHaveBeenCalledTimes(2));
    expect(mocks.importLocalCombatLog.mock.calls[1][0]).toBe(file);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await screen.findByText('Import cancelled. You can retry the same file.');
    fireEvent.click(screen.getByRole('button', { name: 'Start over' }));

    expect(screen.queryByText(/Import cancelled/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry this file' })).not.toBeInTheDocument();
  });

  it('explains that persistence protects already-saved reports from automatic cleanup', async () => {
    const storageDescriptor = Object.getOwnPropertyDescriptor(navigator, 'storage');
    const persist = vi.fn().mockResolvedValue(false);
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: { persist, persisted: vi.fn().mockResolvedValue(false) },
    });

    try {
      render(<LocalReportSelector />);
      const button = await screen.findByRole('button', {
        name: 'Protect reports from automatic browser cleanup',
      });
      fireEvent.click(button);

      expect(
        await screen.findByText(/Your reports are still saved.*may remove them.*storage runs low/),
      ).toBeInTheDocument();
      expect(persist).toHaveBeenCalledOnce();
    } finally {
      if (storageDescriptor) {
        Object.defineProperty(navigator, 'storage', storageDescriptor);
      } else {
        Reflect.deleteProperty(navigator, 'storage');
      }
    }
  });
});
