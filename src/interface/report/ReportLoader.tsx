import { t } from '@lingui/macro';
import { captureException } from 'common/errorLogger';
import { fetchFights, LogNotFoundError } from 'common/fetchWclApi';
import { setReport } from 'interface/actions/report';
import ActivityIndicator from 'interface/ActivityIndicator';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import { getReportCode } from 'interface/selectors/url/report';
import Report from 'parser/core/Report';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { ReportProvider } from 'interface/report/context/ReportContext';
import { Helmet } from 'react-helmet';

import handleApiError from './handleApiError';

// During peak traffic we might want to disable automatic refreshes to avoid hitting the rate limit.
// During regular traffic we should enable this as the fight caching is confusing users.
// Actually leaving this disabled for now so we can continue to serve reports when WCL goes down and high traffic to a specific report page doesn't bring us down (since everything would be logged). To solve the issue of confusion, I'll try improving the fight selection text instead.
const REFRESH_BY_DEFAULT = false;

interface Props {
  children: ReactNode;
}
const ReportLoader = ({ children }: Props) => {
  const location = useLocation();
  const history = useHistory();
  const reportCode = getReportCode(location.pathname);
  const dispatch = useDispatch();
  const [error, setError] = useState<Error | null>(null);
  const [report, setReportState] = useState<Report | null>(null);

  const updateState = useCallback(
    (error: Error | null, report: Report | null) => {
      setError(error);
      setReportState(report);
      dispatch(setReport(report));
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
      loadReport(reportCode, REFRESH_BY_DEFAULT);
    }
  }, [loadReport, reportCode]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  if (error) {
    return handleApiError(error, () => {
      resetState();
      history.push(makeAnalyzerUrl());
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
      <Helmet>
        <title>{report.title}</title>
      </Helmet>

      <ReportProvider report={report} refreshReport={handleRefresh}>
        {children}
      </ReportProvider>
    </>
  );
};
export default ReportLoader;
