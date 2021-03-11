import { t } from '@lingui/macro';
import { useReport } from 'api/useReport';
import ActivityIndicator from 'interface/ActivityIndicator';
import DocumentTitle from 'interface/DocumentTitle';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import handleApiError from 'interface/report/handleApiError';
import { getReportCode } from 'interface/selectors/url/report';
import Report from 'parser/core/Report';
import React, { useMemo } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

// During peak traffic we might want to disable automatic refreshes to avoid hitting the rate limit.
// During regular traffic we should enable this as the fight caching is confusing users.
// Actually leaving this disabled for now so we can continue to serve reports when WCL goes down and high traffic to a specific report page doesn't bring us down (since everything would be logged). To solve the issue of confusion, I'll try improving the fight selection text instead.
const REFRESH_BY_DEFAULT = false;

interface Props extends RouteComponentProps {
  children: (report: Report, handleRefresh: () => void) => React.ReactNode;
}

export const ReportLoader = ({ location, history, children }: Props) => {
  const code = useMemo(() => getReportCode(location.pathname), [location]);
  if (!code) {
    throw Error('ReportLoader could not find report code in URL');
  }

  const { data: report, error, isValidating, forceMutate } = useReport(code, REFRESH_BY_DEFAULT);

  if (error) {
    return handleApiError(error, () => history.push(makeAnalyzerUrl()));
  }

  if (!report || isValidating) {
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
      {/* TODO: Refactor the DocumentTitle away */}
      <DocumentTitle title={report.title} />
      {children(report, forceMutate)}
    </>
  );
};

export default withRouter(ReportLoader);
