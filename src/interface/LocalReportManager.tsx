import { useEffect, useState } from 'react';
import {
  listLocalReports,
  recoverLocalReports,
  removeLocalReport,
  type ReadyLocalManifest,
} from 'local/localReportStore';
import { Link } from 'react-router-dom';

/** A deliberately small manager: local logs are browser data and need an obvious way to reopen or remove them. */
export default function LocalReportManager() {
  const [reports, setReports] = useState<ReadyLocalManifest[]>([]);
  const [error, setError] = useState('');
  const reload = () =>
    void recoverLocalReports()
      .then(listLocalReports)
      .then(setReports)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Unable to open local report storage.'),
      );
  useEffect(reload, []);
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!reports.length) return null;
  return (
    <div style={{ marginTop: 18 }}>
      <h4>Imported local reports</h4>
      <ul className="list-group">
        {reports.map((report) => (
          <li className="list-group-item" key={report.id}>
            <Link to={`/local/${report.id}`}>{report.report.title}</Link>{' '}
            <small>
              {new Date(report.createdAt).toLocaleString()} · {report.report.fights.length} fights
              {report.fileSize ? ` · ${formatBytes(report.fileSize)} source` : ''}
              {report.approximateStoredSize
                ? ` · ~${formatBytes(report.approximateStoredSize)} stored`
                : ''}
              {report.importDurationMs
                ? ` · ${(report.importDurationMs / 1000).toFixed(1)}s import`
                : ''}
              {` · parser ${report.parserVersion}`}
            </small>{' '}
            <button
              className="btn btn-link btn-sm"
              type="button"
              onClick={() => {
                if (window.confirm('Delete this local report?'))
                  void removeLocalReport(report.id).then(reload);
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
};
