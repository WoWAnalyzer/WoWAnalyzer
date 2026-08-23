import { DragEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { importLocalCombatLog, type ImportProgress } from 'local/LocalReportImport';
import { recoverLocalReports } from 'local/localReportStore';
import LocalReportManager from './LocalReportManager';

export default function LocalReportSelector() {
  const input = useRef<HTMLInputElement>(null);
  const abortController = useRef<AbortController | null>(null);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [error, setError] = useState('');
  const [storageWarning, setStorageWarning] = useState('');
  const [persistent, setPersistent] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const importFile = async (file?: File) => {
    if (!file) return;
    const controller = new AbortController();
    abortController.current = controller;
    setError('');
    setStorageWarning('');
    setProgress({ phase: 'discovering', progress: 0 });
    try {
      if (navigator.storage?.estimate) {
        const estimate = await navigator.storage.estimate();
        const available = Math.max(0, (estimate.quota ?? 0) - (estimate.usage ?? 0));
        // Normalized events plus IndexedDB indexes are commonly larger than the text file.
        if (estimate.quota && file.size * 3 > available) {
          setStorageWarning(
            `This ${formatBytes(file.size)} file may exceed the browser's remaining ${formatBytes(available)} storage allowance.`,
          );
        }
      }
      await recoverLocalReports();
      const id = await importLocalCombatLog(file, setProgress, controller.signal);
      navigate(`/local/${id}`);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === 'AbortError') {
        setError('Import cancelled.');
      } else {
        setError(reason instanceof Error ? reason.message : 'Unable to import this combat log.');
      }
      setProgress(null);
    } finally {
      abortController.current = null;
      if (input.current) input.current.value = '';
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    void importFile(event.dataTransfer.files[0]);
  };

  return (
    <div>
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        style={{ border: '1px dashed rgba(255,255,255,.45)', padding: 20, textAlign: 'center' }}
      >
        <input
          ref={input}
          type="file"
          accept=".txt,text/plain"
          onChange={(event) => void importFile(event.target.files?.[0])}
          style={{ display: 'none' }}
        />
        <button
          className="btn btn-primary"
          type="button"
          disabled={progress !== null}
          onClick={() => input.current?.click()}
        >
          Choose combat log
        </button>
        <span style={{ marginLeft: 10 }}>or drop it here</span>
      </div>
      <small>
        Experimental — requires a current Retail advanced combat log. Your log stays in this
        browser.
      </small>
      {navigator.storage?.persist && (
        <div>
          <button
            className="btn btn-link btn-sm"
            type="button"
            onClick={() => void navigator.storage.persist().then(setPersistent)}
          >
            Ask the browser to keep imported reports
          </button>
          {persistent !== null && (
            <small>{persistent ? ' Persistent storage granted.' : ' The browser declined.'}</small>
          )}
        </div>
      )}
      {storageWarning && (
        <div className="alert alert-warning" role="alert" style={{ marginTop: 10 }}>
          {storageWarning}
        </div>
      )}
      {progress && (
        <div role="status" style={{ marginTop: 10 }}>
          <progress value={progress.progress} max={1} style={{ width: '100%' }} />
          <span>
            {progress.phase === 'discovering'
              ? 'Discovering encounters'
              : progress.phase === 'normalizing'
                ? 'Normalizing events'
                : 'Saving'}{' '}
            ({Math.round(progress.progress * 100)}%)
          </span>{' '}
          <button
            className="btn btn-link"
            type="button"
            onClick={() => abortController.current?.abort()}
          >
            Cancel
          </button>
        </div>
      )}
      {error && (
        <div className="alert alert-danger" role="alert" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}
      <LocalReportManager />
    </div>
  );
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
};
