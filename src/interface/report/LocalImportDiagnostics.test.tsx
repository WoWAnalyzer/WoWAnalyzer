import { render, screen } from '@testing-library/react';
import type { ReadyLocalManifest } from 'local/localReportStore';

import { LocalImportDiagnosticsView } from './LocalImportDiagnostics';

const manifest = {
  id: 'local-id',
  schemaVersion: 1,
  parserVersion: 'retail-v22.8',
  status: 'ready',
  importKind: 'target-dummy',
  report: {},
  players: {},
  diagnostics: [
    { line: 0, severity: 'warning', message: 'Live combat ratings were defaulted to zero.' },
    { line: 0, severity: 'warning', message: 'Pull-time auras were defaulted to empty.' },
  ],
  createdAt: 0,
} as ReadyLocalManifest;

describe('LocalImportDiagnosticsView', () => {
  it('surfaces persisted target-dummy limitations without crowding the analysis', () => {
    render(<LocalImportDiagnosticsView manifest={manifest} />);

    expect(screen.getByText('Target-dummy import notes (2)')).toBeInTheDocument();
    expect(screen.getByText('Live combat ratings were defaulted to zero.')).toBeInTheDocument();
    expect(screen.getByText('Pull-time auras were defaulted to empty.')).toBeInTheDocument();
  });

  it('does not render encounter-log diagnostics in the target-dummy disclosure', () => {
    const { container } = render(
      <LocalImportDiagnosticsView manifest={{ ...manifest, importKind: 'encounter-log' }} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
