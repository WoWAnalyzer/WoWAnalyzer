import React, { Component } from 'react';

import Changelog from './Changelog';

class ReportSelecter extends Component {
  static propTypes = {
    onSubmit: React.PropTypes.func.isRequired,
  };

  codeInput = null;

  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.codeInput.focus();
  }

  handleSubmit(e) {
    const { onSubmit } = this.props;

    e.preventDefault();

    const code = this.codeInput.value;

    if (!code) {
      alert('Enter the report code.');
      return;
    }

    onSubmit(code.trim());
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} className="form-inline">
        <h1>Analyze your Holy Paladin performance</h1>

        <div className="row">
          <div className="col-md-6">
            <div className="panel">
              <div className="panel-heading">
                <h2>The Holy Paladin Analyzer</h2>
              </div>
              <div className="panel-body">
                <img src="./mastery-radius.png" alt="Mastery radius" className="pull-right" style={{ margin: 15 }} />
                Use this tool to analyze your performance as a Holy Paladin based on important metrics for the spec.<br /><br />

                You will need a Warcraft Logs report with advanced combat logging enabled to start. Private logs can not be used, if your guild has private logs you will have to
                {' '}<a href="https://www.warcraftlogs.com/help/start/">upload your own logs</a> or change the existing logs to the
                {' '}<i>unlisted</i> privacy option instead.<br /><br />

                Feature requests (<dfn data-tip="Provided that you're not using one of Microsoft's browsers.">and bug reports*</dfn>) are welcome!{' '}
                <i>@Zerotorescue</i> on <a href="https://discordapp.com/invite/hammerofwrath">Discord</a> or create an issue{' '}
                <a href="https://github.com/MartijnHols/HolyPaladinAnalyzer/issues">here</a>.
              </div>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <h2>Analyze report</h2>
              </div>
              <div className="panel-body">
                <strong>Enter your Warcraft Logs report code.</strong><br />
                https://www.warcraftlogs.com/reports/<input
                  type="text"
                  name="code"
                  className="form-control"
                  ref={(elem) => {
                    this.codeInput = elem;
                  }}
                  style={{ width: 175 }}
                  placeholder="Report code"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />/<br /><br />

                <button type="submit" className="btn btn-primary">
                  Analyze <span className="glyphicon glyphicon-chevron-right" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <h2>Source code</h2>
              </div>
              <div className="panel-body text-muted">
                Full source is available on <a href="https://github.com/MartijnHols/HolyPaladinAnalyzer">GitHub</a>. The readme also contains information about the implemented features as well as a list of the percentage breakpoints for most suggestions.<br /><br />

                Created by Zerotorescue for the <a href="https://discordapp.com/invite/hammerofwrath">#holy Discord</a>. You can usually find helpful people there.
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="panel">
              <div className="panel-heading">
                <h2>Features</h2>
              </div>
              <div className="panel-body">
                <div className="row">
                  <div className="col-md-6 text-center">
                    <img src="./img/items.png" style={{ maxWidth: '100%', border: '1px solid black', borderRadius: 5 }} /><br />
                    Item performance breakdowns
                  </div>
                  <div className="col-md-6 text-center">
                    <img src="./img/suggestions.png" style={{ maxWidth: '100%', border: '1px solid black', borderRadius: 5 }} /><br />
                    Suggestions for improvement
                  </div>
                </div>
                <div className="row" style={{ marginTop: 15 }}>
                  <div className="col-md-6 text-center">
                    <img src="./img/important-metrics.png" style={{ maxWidth: '100%', border: '1px solid black', borderRadius: 5 }} /><br />
                    Important metrics
                  </div>
                  <div className="col-md-6 text-center">
                    <img src="./img/mana-breakdown.png" style={{ maxWidth: '100%', border: '1px solid black', borderRadius: 5 }} /><br />
                    Mana breakdown
                  </div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <h2>Changes</h2>
              </div>
              <div className="panel-body text-muted">
                <Changelog />
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }
}

export default ReportSelecter;
