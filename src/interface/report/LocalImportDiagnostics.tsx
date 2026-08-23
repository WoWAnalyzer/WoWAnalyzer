import { useEffect, useState } from 'react';
import type { ReadyLocalManifest } from 'local/localReportStore';
import { getReadyLocalReport } from 'local/localReportStore';

export function LocalImportDiagnosticsView({ manifest }: { manifest: ReadyLocalManifest }) {
  if (manifest.importKind !== 'target-dummy' || manifest.diagnostics.length === 0) return null;

  return (
    <div className="container" style={{ marginTop: 10 }}>
      <details className="alert alert-warning">
        <summary>Target-dummy import notes ({manifest.diagnostics.length})</summary>
        <p style={{ marginTop: 10 }}>
          This analysis uses synthesized encounter metadata. Review the limitations recorded during
          import if a result looks unexpected.
        </p>
        <ul>
          {manifest.diagnostics.map((diagnostic, index) => (
            <li key={`${diagnostic.line}:${index}`}>{diagnostic.message}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export default function LocalImportDiagnostics({ reportId }: { reportId?: string }) {
  const [manifest, setManifest] = useState<ReadyLocalManifest | null>(null);

  useEffect(() => {
    let current = true;
    setManifest(null);
    if (reportId) {
      void getReadyLocalReport(reportId)
        .then((value) => {
          if (current) setManifest(value);
        })
        .catch(() => undefined);
    }
    return () => {
      current = false;
    };
  }, [reportId]);

  return manifest ? <LocalImportDiagnosticsView manifest={manifest} /> : null;
}
