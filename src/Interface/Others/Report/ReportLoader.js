import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { fetchFights, LogNotFoundError } from 'common/fetchWclApi';
import { captureException } from 'common/errorLogger';
import { setReport } from 'Interface/actions/report';
import { getReportCode } from 'Interface/selectors/url/report';
import makeAnalyzerUrl from 'Interface/common/makeAnalyzerUrl';
import ActivityIndicator from 'Interface/common/ActivityIndicator';

import handleApiError from './handleApiError';

class ReportLoader extends React.PureComponent {
  static propTypes = {
    children: PropTypes.func.isRequired,
    reportCode: PropTypes.string,
    setReport: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired, // adds to browser history
    }),
  };

  constructor(props) {
    super(props);
    // Setup
    this.state = {
      error: null,
      report: null,
    };
    this.handleRefresh = this.handleRefresh.bind(this);
    // Initial load
    if (this.props.reportCode) {
      // noinspection JSIgnoredPromiseFromCall
      this.loadReport(this.props.reportCode);
    }
  }
  setState(error = null, report = null) {
    super.setState({
      error,
      report,
    });
    this.props.setReport(report);
  }
  resetState() {
    this.setState(null, null);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.reportCode && this.props.reportCode !== prevProps.reportCode) {
      this.loadReport(this.props.reportCode);
    }
  }
  async loadReport(reportCode, refresh = false) {
    try {
      this.resetState();
      const report = await fetchFights(reportCode, refresh);
      if (reportCode !== this.props.reportCode) {
        return; // the user switched reports already
      }
      this.setState(null, {
        ...report,
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
    this.loadReport(this.props.reportCode, true);
  }

  renderError(error) {
    return handleApiError(error, () => {
      this.resetState();
      this.props.history.push(makeAnalyzerUrl());
    });
  }
  renderLoading() {
    return <ActivityIndicator text="Pulling report info..." />;
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

    return this.props.children(report, this.handleRefresh);
  }
}

const mapStateToProps = state => ({
  reportCode: getReportCode(state),
});
export default compose(
  withRouter,
  connect(mapStateToProps, {
    setReport,
  })
)(ReportLoader);
