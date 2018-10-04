import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { fetchFights, LogNotFoundError } from 'common/fetchWclApi';
import { captureException } from 'common/errorLogger';
import { setReport } from 'interface/actions/report';
import { getReportCode } from 'interface/selectors/url/report';
import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';
import ActivityIndicator from 'interface/common/ActivityIndicator';
import DocumentTitle from 'interface/common/DocumentTitle';

import handleApiError from './handleApiError';

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
      this.loadReport(this.props.reportCode);
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.reportCode && this.props.reportCode !== prevProps.reportCode) {
      // noinspection JSIgnoredPromiseFromCall
      this.loadReport(this.props.reportCode);
    }
  }
  async loadReport(reportCode, refresh = false) {
    try {
      this.resetState();
      const report = await fetchFights(reportCode, refresh);
      if (this.props.reportCode !== reportCode) {
        return; // the user switched report already
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

    return (
      <>
        {/* TODO: Refactor the DocumentTitle away */}
        <DocumentTitle title={report.title} />

        {this.props.children(report, this.handleRefresh)}
      </>
    );
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
