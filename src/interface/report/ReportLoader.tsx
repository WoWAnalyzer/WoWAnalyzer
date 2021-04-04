import { t } from '@lingui/macro';
import { captureException } from 'common/errorLogger';
import { fetchFights, LogNotFoundError } from 'common/fetchWclApi';
import { setReport } from 'interface/actions/report';
import ActivityIndicator from 'interface/ActivityIndicator';
import DocumentTitle from 'interface/DocumentTitle';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import { RootState } from 'interface/reducers';
import { getReportCode } from 'interface/selectors/url/report';
import Report from 'parser/core/Report';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

import handleApiError from './handleApiError';

// During peak traffic we might want to disable automatic refreshes to avoid hitting the rate limit.
// During regular traffic we should enable this as the fight caching is confusing users.
// Actually leaving this disabled for now so we can continue to serve reports when WCL goes down and high traffic to a specific report page doesn't bring us down (since everything would be logged). To solve the issue of confusion, I'll try improving the fight selection text instead.
const REFRESH_BY_DEFAULT = false;

interface ConnectedProps extends RouteComponentProps {
  reportCode: string;
  setReport: (report: Report | null) => void;
}

interface PassedProps {
  children: (report: Report, handleRefresh: () => void) => React.ReactNode;
}

type Props = ConnectedProps & PassedProps;

interface State {
  error: Error | null;
  report: Report | null;
}

class ReportLoader extends React.PureComponent<Props, State> {
  state: State = {
    error: null,
    report: null,
  };

  constructor(props: Props) {
    super(props);
    this.handleRefresh = this.handleRefresh.bind(this);
  }
  updateState(error: Error | null = null, report: Report | null = null) {
    this.setState({
      error,
      report,
    });
    // We need to set the report in the global state so the NavigationBar, which is not a child of this component, can also use it
    this.props.setReport(report);
  }
  resetState() {
    this.updateState(null, null);
  }

  componentDidMount() {
    if (this.props.reportCode) {
      // noinspection JSIgnoredPromiseFromCall
      this.loadReport(this.props.reportCode, REFRESH_BY_DEFAULT);
    }
  }
  component(prevProps: Props) {
    if (this.props.reportCode && this.props.reportCode !== prevProps.reportCode) {
      // noinspection JSIgnoredPromiseFromCall
      this.loadReport(this.props.reportCode);
    }
  }
  async loadReport(reportCode: string, refresh: boolean = false) {
    const isAnonymous = reportCode.startsWith('a:');
    try {
      this.resetState();
      const report = await fetchFights(reportCode, refresh);
      if (this.props.reportCode !== reportCode) {
        return; // the user switched report already
      }
      this.updateState(null, {
        ...report,
        isAnonymous,
        code: reportCode, // Pass the code so know which report this is
        // TODO: Remove the code prop
      });
      // We need to set the report in the global state so the NavigationBar, which is not a child of this component, can also use it
    } catch (err) {
      const isCommonError = err instanceof LogNotFoundError;
      if (!isCommonError) {
        captureException(err);
      }
      this.updateState(err, null);
    }
  }
  handleRefresh() {
    // noinspection JSIgnoredPromiseFromCall
    this.loadReport(this.props.reportCode, true);
  }

  renderError(error: Error) {
    return handleApiError(error, () => {
      this.resetState();
      this.props.history.push(makeAnalyzerUrl());
    });
  }
  renderLoading() {
    return (
      <ActivityIndicator
        text={t({
          id: 'interface.report.reportLoader',
          message: `Pulling report info...`,
        })}
      />
    );
  }
  render() {
    const error = this.state.error;
    if (error) {
      return this.renderError(error);
    }

    const report = this.state.report;
    if (report === null) {
      return this.renderLoading();
    }

    return (
      <>
        {/* TODO: Refactor the DocumentTitle away */}
        <DocumentTitle title={report.title} />

        {this.props.children(report, this.handleRefresh)}
      </>
    );
  }
}

const mapStateToProps = (state: RootState, props: RouteComponentProps) => ({
  reportCode: getReportCode(props.location.pathname),
});
export default compose(
  withRouter,
  connect(mapStateToProps, {
    setReport,
  }),
)(ReportLoader) as React.ComponentType<PassedProps>;
