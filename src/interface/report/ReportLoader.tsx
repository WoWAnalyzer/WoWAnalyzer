import { captureException } from 'common/errorLogger';
import ActivityIndicator from 'interface/ActivityIndicator';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import Report from 'parser/core/Report';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ReportProvider } from 'interface/report/context/ReportContext';
import DocumentTitle from 'interface/DocumentTitle';

import handleApiError, { isCommonError } from './handleApiError';
import { clearReport, setReport as setNavigationReport } from 'interface/reducers/navigation';
import { useLingui } from '@lingui/react';
import { recoverLocalReports } from 'local/localReportStore';
import {
  LocalReportQuotaError,
  LocalReportStorageError,
  LocalReportUnavailableError,
} from 'local/localReportStore';
import { AnalysisDataSourceContext } from 'report-data/AnalysisDataSourceContext';
import type { AnalysisDataSource } from 'report-data/AnalysisDataSource';
import { createAnalysisDataSource } from './createAnalysisDataSource';
import FullscreenError from 'interface/FullscreenError';
import LocalImportDiagnostics from './LocalImportDiagnostics';

const pageWasReloaded = () =>
  performance
    .getEntriesByType('navigation')
    .filter((event) => (event as PerformanceNavigationTiming).type === 'reload').length > 0;

const pageFirstInputTime = () => {
  const startTime = performance.getEntriesByType('first-input')[0]?.startTime;

  if (startTime === undefined) {
    return undefined;
  }

  return Date.now() - performance.now() + startTime;
};

// TODO: this can be lifted to a shared file
const useSessionState = (
  key: string,
  initialValue: string | null,
): [string | null, (newValue: string | null) => void] => {
  const [value, setValue] = useState(window.sessionStorage.getItem(key) ?? initialValue);

  useEffect(() => {
    if (initialValue !== null && window.sessionStorage.getItem(key) === null) {
      window.sessionStorage.setItem(key, initialValue);
    }
    // intentionally omitting initialValue to avoid accidental overwrites
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setSessionValue = useCallback(
    (newValue: string | null) => {
      if (newValue === null) {
        window.sessionStorage.removeItem(key);
      } else {
        window.sessionStorage.setItem(key, newValue);
      }
      setValue(newValue);
    },
    [key],
  );

  return [value, setSessionValue];
};

/**
 * Allow a "natural" refresh (aka Ctrl/Cmd-R) to refresh the fight list, which is probably what the user wants.
 *
 * This is rate-limited to once per 30 seconds (per browser tab) using session storage.
 */
const shouldForceRefresh = (fightId: number | null, lastForceRefreshTime: number) => {
  // we use the first input time to avoid chain refreshes in cases where the state gets trashed by a parent component
  const inputTime = pageFirstInputTime() ?? 0;
  if (
    // if a fight is selected, never force refresh
    fightId === null &&
    pageWasReloaded() &&
    // only refresh if the first input hasn't happened or happened very shortly before this.
    // this is done to avoid forcing refreshes when doing normal navigations within
    // the SPA *after* having refreshed an unrelated page.
    (inputTime === 0 || Date.now() - inputTime <= 1000) &&
    // rate limit --- once per 30s
    Date.now() - lastForceRefreshTime >= 30000
  ) {
    return true;
  }
  return false;
};

interface Props {
  children: ReactNode;
}
const ReportLoader = ({ children }: Props) => {
  const navigate = useNavigate();
  const { reportCode, localReportId, fightId } = useParams();
  const dispatch = useDispatch();
  const [error, setError] = useState<Error | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const { i18n } = useLingui();
  // One source instance per route keeps caches, cancellation and capability decisions stable for children.
  const dataSource = useMemo<AnalysisDataSource | null>(() => {
    return createAnalysisDataSource({ localReportId, reportCode });
  }, [localReportId, reportCode]);

  const [lastForceRefreshTimestamp, setForceRefreshTimestamp] = useSessionState(
    'report:last-force-refresh',
    null,
  );

  const updateState = useCallback(
    (error: Error | null, report: Report | null) => {
      setError(error);
      setReport(report);
      if (report) {
        dispatch(
          setNavigationReport({
            link: makeAnalyzerUrl(report),
            title: report.title,
          }),
        );
      } else {
        dispatch(clearReport());
      }
    },
    [dispatch],
  );

  const resetState = useCallback(() => updateState(null, null), [updateState]);

  const loadReport = useCallback(
    async (code: string, refresh = false) => {
      const isAnonymous = code.startsWith('a:');
      try {
        resetState();
        const source = dataSource;
        if (!source) return;
        if (source.locator.kind === 'local') {
          await recoverLocalReports();
        }
        const report = await source.loadReport({ refresh });
        if ((localReportId && localReportId !== code) || (!localReportId && reportCode !== code)) {
          return; // the user switched report already
        }
        updateState(null, {
          ...report,
          isAnonymous,
          code: reportCode ?? localReportId!, // compatibility for existing analysis modules
          locator: source.locator,
          // TODO: Remove the code prop
        });
        // We need to set the report in the global state so the NavigationBar, which is not a child of this component, can also use it
      } catch (err) {
        if (!isCommonError(err)) {
          captureException(err as Error);
        }
        updateState(err as Error, null);
      }
    },
    [dataSource, localReportId, reportCode, resetState, updateState],
  );

  const handleRefresh = useCallback(() => {
    if (dataSource?.refreshReport && reportCode) {
      // noinspection JSIgnoredPromiseFromCall
      loadReport(reportCode, true);
    }
  }, [dataSource, loadReport, reportCode]);

  useEffect(() => {
    const fightIdAsNumber = fightId ? Number(fightId) : null;
    if (reportCode || localReportId) {
      const refresh = Boolean(
        reportCode &&
        shouldForceRefresh(
          fightIdAsNumber,
          lastForceRefreshTimestamp ? Number(lastForceRefreshTimestamp) : 0,
        ),
      );
      if (refresh) {
        setForceRefreshTimestamp(String(Date.now()));
      }

      // noinspection JSIgnoredPromiseFromCall
      loadReport(reportCode ?? localReportId!, refresh);
    }
    // intentionally omit refresh-related state from this effect's deps to avoid triggering another load after a force refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadReport, reportCode, localReportId]);

  if (error) {
    if (
      localReportId ||
      error instanceof LocalReportUnavailableError ||
      error instanceof LocalReportQuotaError ||
      error instanceof LocalReportStorageError
    ) {
      return (
        <FullscreenError
          error="Local report unavailable"
          details={error.message || 'The imported combat log could not be opened.'}
          background="https://media.giphy.com/media/m4TbeLYX5MaZy/giphy.gif"
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/local-import')}
          >
            Return to local imports
          </button>
        </FullscreenError>
      );
    }
    return handleApiError(error, () => {
      resetState();
      navigate(makeAnalyzerUrl());
    });
  }
  if (!report) {
    return (
      <ActivityIndicator
        text={i18n._({
          id: 'interface.report.reportLoader',
          message: `Pulling report info...`,
        })}
      />
    );
  }

  return (
    <>
      <DocumentTitle title={report.title} />

      <LocalImportDiagnostics reportId={localReportId} />

      <AnalysisDataSourceContext.Provider value={dataSource!}>
        <ReportProvider report={report} refreshReport={handleRefresh}>
          {children}
        </ReportProvider>
      </AnalysisDataSourceContext.Provider>
    </>
  );
};
export default ReportLoader;
