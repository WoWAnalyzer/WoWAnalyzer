import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { t } from '@lingui/macro';

import { fetchFights, LogNotFoundError } from 'common/fetchWclApi';
import { captureException } from 'common/errorLogger';
import { setReport } from 'interface/actions/report';
import { getReportCode } from 'interface/selectors/url/report';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import ActivityIndicator from 'interface/ActivityIndicator';
import DocumentTitle from 'interface/DocumentTitle';

import handleApiError from './handleApiError';

// During peak traffic we might want to disable automatic refreshes to avoid hitting the rate limit.
// During regular traffic we should enable this as the fight caching is confusing users.
// Actually leaving this disabled for now so we can continue to serve reports when WCL goes down and high traffic to a specific report page doesn't bring us down (since everything would be logged). To solve the issue of confusion, I'll try improving the fight selection text instead.
const REFRESH_BY_DEFAULT = false;

class ReportLoader extends React.PureComponent {
  static propTypes = {
    children: PropTypes.func.isRequired,
    reportCode: PropTypes.string,
    setReport: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired, // adds to browser history
    }).isRequired,
  };
  state = {
    error: null,
    report: null,
  };

  constructor(props) {
    super(props);
    this.handleRefresh = this.handleRefresh.bind(this);
  }
  setState(error = null, report = null) {
    super.setState({
      error,
      report,
    });
    // We need to set the report in the global state so the NavigationBar, which is not a child of this component, can also use it
    this.props.setReport(report);
  }
  resetState() {
    this.setState(null, null);
  }

  componentDidMount() {
    if (this.props.reportCode) {
      // noinspection JSIgnoredPromiseFromCall
      this.loadReport(this.props.reportCode, REFRESH_BY_DEFAULT);
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.reportCode && this.props.reportCode !== prevProps.reportCode) {
      // noinspection JSIgnoredPromiseFromCall
      this.loadReport(this.props.reportCode);
    }
  }
  async loadReport(reportCode, refresh = false) {
    const isAnonymous = reportCode.startsWith('a:');
    try {
      this.resetState();
      const report = await fetchFights(reportCode, refresh);
      if (this.props.reportCode !== reportCode) {
        return; // the user switched report already
      }
      this.setState(null, {
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
      this.setState(err, null);
    }
  }
  handleRefresh() {
    // noinspection JSIgnoredPromiseFromCall
    this.loadReport(this.props.reportCode, true);
  }

  renderError(error) {
    return handleApiError(error, () => {
      this.resetState();
      this.props.history.push(makeAnalyzerUrl());
    });
  }
  renderLoading() {
    return (
      <ActivityIndicator text={t({
        id: "interface.report.reportLoader",
        message: `Pulling report info...`
      })} />
    );
  }
  render() {
    const error = this.state.error;
    if (error) {
      return this.renderError(error);
    }

    const report = this.state.report;
    if (!report) {
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

const mapStateToProps = (state, props) => ({
  reportCode: getReportCode(props.location.pathname),
});
export default compose(
  withRouter,
  connect(mapStateToProps, {
    setReport,
  }),
)(ReportLoader);
