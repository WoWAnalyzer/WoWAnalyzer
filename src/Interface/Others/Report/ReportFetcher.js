import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { LogNotFoundError } from 'common/fetchWclApi';
import { captureException } from 'common/errorLogger';
import { fetchReport } from 'Interface/actions/report';
import { getReportCode } from 'Interface/selectors/url/report';
import makeAnalyzerUrl from 'Interface/common/makeAnalyzerUrl';
import ActivityIndicator from 'Interface/common/ActivityIndicator';

import handleApiError from './handleApiError';

class ReportFetcher extends React.PureComponent {
  static propTypes = {
    children: PropTypes.func.isRequired,
    reportCode: PropTypes.string,
    fetchReport: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired, // adds to browser history
    }),
  };

  constructor() {
    super();
    this.state = {
      error: null,
      report: null,
    };
  }

  componentWillMount() {
    this.fetchReportIfNecessary({});
  }
  componentDidUpdate(prevProps, prevState) {
    this.fetchReportIfNecessary(prevProps);
  }
  fetchReportIfNecessary(prevProps) {
    if (this.props.reportCode && this.props.reportCode !== prevProps.reportCode) {
      this.fetchReport();
    }
  }
  fetchReport(refresh = false) {
    this.setState({
      error: null,
      report: null,
    });
    const reportCode = this.props.reportCode;
    this.props.fetchReport(reportCode, refresh)
      .then(report => {
        if (reportCode !== this.props.reportCode) {
          return; // the user switched reports already
        }
        this.setState({
          error: null,
          report,
        });
      })
      .catch(err => {
        const isCommonError = err instanceof LogNotFoundError;
        if (!isCommonError) {
          captureException(err);
        }
        this.setState({
          error: err,
          report: null,
        });
      });
  }

  render() {
    const error = this.state.error;
    if (error) {
      return handleApiError(error, () => {
        this.setState({
          error: null,
          report: null,
        });
        this.props.history.push(makeAnalyzerUrl());
      });
    }
    const report = this.state.report;
    if (!report) {
      return <ActivityIndicator text="Pulling report info..." />;
    }

    return this.props.children(report);
  }
}

const mapStateToProps = state => ({
  reportCode: getReportCode(state),
});
export default compose(
  withRouter,
  connect(mapStateToProps, {
    fetchReport,
  })
)(ReportFetcher);
