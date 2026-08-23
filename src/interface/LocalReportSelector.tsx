import { DragEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  importLocalCombatLog,
  type ImportProgress,
  type TargetDummyInputHandler,
} from 'local/LocalReportImport';
import type {
  TargetDummyInputRequest,
  TargetDummyPreparationInput,
} from 'local/localCombatLogProtocol';
import { getReadyLocalReport, recoverLocalReports } from 'local/localReportStore';
import makeAnalyzerUrl from './makeAnalyzerUrl';
import LocalReportManager from './LocalReportManager';
import TargetDummyImportInput from './TargetDummyImportInput';

export default function LocalReportSelector() {
  const input = useRef<HTMLInputElement>(null);
  const abortController = useRef<AbortController | null>(null);
  const startingOverController = useRef<AbortController | null>(null);
  const targetDummyInputResolver = useRef<((input: TargetDummyPreparationInput) => void) | null>(
    null,
  );
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [targetDummyRequest, setTargetDummyRequest] = useState<TargetDummyInputRequest | null>(
    null,
  );
  const [targetDummySubmitting, setTargetDummySubmitting] = useState(false);
  const [error, setError] = useState('');
  const [storageWarning, setStorageWarning] = useState('');
  const [persistent, setPersistent] = useState<boolean | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!navigator.storage?.persisted) return;
    void navigator.storage
      .persisted()
      .then(setPersistent)
      .catch(() => setPersistent(false));
  }, []);

  const requestPersistentStorage = async () => {
    try {
      setPersistent(await navigator.storage.persist());
    } catch {
      setPersistent(false);
    }
  };

  const requestTargetDummyInput: TargetDummyInputHandler = (request) => {
    setTargetDummyRequest(request);
    setTargetDummySubmitting(false);
    return new Promise((resolve) => {
      targetDummyInputResolver.current = resolve;
    });
  };

  const submitTargetDummyInput = (targetDummyInput: TargetDummyPreparationInput) => {
    const resolve = targetDummyInputResolver.current;
    if (!resolve) return;
    targetDummyInputResolver.current = null;
    setTargetDummySubmitting(true);
    resolve(targetDummyInput);
  };

  const updateProgress = (nextProgress: ImportProgress) => {
    setProgress(nextProgress);
    if (nextProgress.phase !== 'discovering') {
      setTargetDummyRequest(null);
      setTargetDummySubmitting(false);
    }
  };

  const importFile = async (file?: File) => {
    if (!file || abortController.current) return;
    const controller = new AbortController();
    abortController.current = controller;
    setLastFile(file);
    setError('');
    setStorageWarning('');
    setTargetDummyRequest(null);
    setTargetDummySubmitting(false);
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
      const id = await importLocalCombatLog(
        file,
        updateProgress,
        controller.signal,
        requestTargetDummyInput,
      );
      const destination = await getReadyLocalReport(id)
        .then((manifest) => {
          const fight = manifest.report.fights.length === 1 ? manifest.report.fights[0] : undefined;
          const fightPlayers = fight ? (manifest.players[fight.id] ?? []) : [];
          return manifest.importKind === 'target-dummy' && fight && fightPlayers.length === 1
            ? makeAnalyzerUrl(manifest.report, fight.id, fightPlayers[0].id)
            : `/local/${id}`;
        })
        .catch(() => `/local/${id}`);
      navigate(destination);
    } catch (reason) {
      const startingOver = startingOverController.current === controller;
      if (reason instanceof DOMException && reason.name === 'AbortError') {
        if (!startingOver) setError('Import cancelled. You can retry the same file.');
      } else {
        setError(reason instanceof Error ? reason.message : 'Unable to import this combat log.');
      }
      setTargetDummyRequest(null);
      setTargetDummySubmitting(false);
      setProgress(null);
    } finally {
      if (startingOverController.current === controller) startingOverController.current = null;
      targetDummyInputResolver.current = null;
      abortController.current = null;
      if (input.current) input.current.value = '';
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (progress) return;
    void importFile(event.dataTransfer.files[0]);
  };

  const startOver = () => {
    const controller = abortController.current;
    if (controller) {
      startingOverController.current = controller;
      controller.abort();
    }
    setLastFile(null);
    setError('');
    setStorageWarning('');
    setTargetDummyRequest(null);
    setTargetDummySubmitting(false);
    setProgress(null);
    if (input.current) input.current.value = '';
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
      {typeof navigator.storage?.persist === 'function' && (
        <div>
          {persistent === true ? (
            <small>Imported reports are protected from automatic browser cleanup.</small>
          ) : (
            <>
              <button
                className="btn btn-link btn-sm"
                type="button"
                onClick={() => void requestPersistentStorage()}
              >
                Protect reports from automatic browser cleanup
              </button>
              {persistent === false && (
                <small>
                  Your reports are still saved. This browser may remove them if device storage runs
                  low.
                </small>
              )}
            </>
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
              ? targetDummyRequest
                ? targetDummySubmitting
                  ? 'Validating target-dummy details'
                  : 'Waiting for target-dummy details'
                : 'Discovering encounters and target-dummy attempts'
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
      {targetDummyRequest && (
        <TargetDummyImportInput
          request={targetDummyRequest}
          disabled={targetDummySubmitting}
          onSubmit={submitTargetDummyInput}
          onStartOver={startOver}
        />
      )}
      {error && (
        <div className="alert alert-danger" role="alert" style={{ marginTop: 10 }}>
          {error}
          <div style={{ marginTop: 8 }}>
            {lastFile && (
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={() => void importFile(lastFile)}
              >
                Retry this file
              </button>
            )}{' '}
            <button className="btn btn-link btn-sm" type="button" onClick={startOver}>
              Start over
            </button>
          </div>
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
