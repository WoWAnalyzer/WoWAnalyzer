import { t } from '@lingui/macro';
import { captureException } from 'common/errorLogger';
import { fetchFights, LogNotFoundError } from 'common/fetchWclApi';
import ActivityIndicator from 'interface/ActivityIndicator';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import Report from 'parser/core/Report';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ReportProvider } from 'interface/report/context/ReportContext';
import DocumentTitle from 'interface/DocumentTitle';

import handleApiError from './handleApiError';
import { setCombatants } from 'interface/reducers/combatants';
import { clearReport, setReport as setNavigationReport } from 'interface/reducers/navigation';

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
  const { reportCode, fightId } = useParams();
  const dispatch = useDispatch();
  const [error, setError] = useState<Error | null>(null);
  const [report, setReportState] = useState<Report | null>(null);

  const [lastForceRefreshTimestamp, setForceRefreshTimestamp] = useSessionState(
    'report:last-force-refresh',
    null,
  );

  const updateState = useCallback(
    (error: Error | null, report: Report | null) => {
      setError(error);
      setReportState(report);
      dispatch(setCombatants(null));
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
    async (code: string, refresh: boolean = false) => {
      const isAnonymous = code.startsWith('a:');
      try {
        resetState();
        const report = await fetchFights(code, refresh);
        if (reportCode !== code) {
          return; // the user switched report already
        }
        updateState(null, {
          ...report,
          isAnonymous,
          code: reportCode, // Pass the code so know which report this is
          // TODO: Remove the code prop
        });
        // We need to set the report in the global state so the NavigationBar, which is not a child of this component, can also use it
      } catch (err) {
        const isCommonError = err instanceof LogNotFoundError;
        if (!isCommonError) {
          captureException(err as Error);
        }
        updateState(err as Error, null);
      }
    },
    [reportCode, resetState, updateState],
  );

  const handleRefresh = useCallback(() => {
    if (reportCode) {
      // noinspection JSIgnoredPromiseFromCall
      loadReport(reportCode, true);
    }
  }, [loadReport, reportCode]);

  useEffect(() => {
    const fightIdAsNumber = fightId ? Number(fightId) : null;
    if (reportCode) {
      const refresh = shouldForceRefresh(
        fightIdAsNumber,
        lastForceRefreshTimestamp ? Number(lastForceRefreshTimestamp) : 0,
      );
      if (refresh) {
        setForceRefreshTimestamp(String(Date.now()));
      }

      // noinspection JSIgnoredPromiseFromCall
      loadReport(reportCode, refresh);
    }
    // intentionally omit refresh-related state from this effect's deps to avoid triggering another load after a force refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadReport, reportCode]);

  if (error) {
    return handleApiError(error, () => {
      resetState();
      navigate(makeAnalyzerUrl());
    });
  }
  if (!report) {
    return (
      <ActivityIndicator
        text={t({
          id: 'interface.report.reportLoader',
          message: `Pulling report info...`,
        })}
      />
    );
  }

  return (
    <>
      <DocumentTitle title={report.title} />

      <ReportProvider report={report} refreshReport={handleRefresh}>
        {children}
      </ReportProvider>
    </>
  );
};
export default ReportLoader;
