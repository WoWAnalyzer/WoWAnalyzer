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
      <div>
        <form onSubmit={this.handleSubmit} className="form-inline">
          <h1>Analyze your Holy Paladin performance</h1>

          <div className="panel">
            <div className="panel-body">
              <img src="./mastery-radius.png" alt="Mastery radius" className="pull-right" style={{ margin: 15 }} />
              Use this tool to analyze your performance as a Holy Paladin based on important metrics for the spec.<br /><br />

              You will need a Warcraft Logs report with advanced combat logging enabled to start. Private logs can not be used, if your guild has private logs you will have to
              {' '}<a href="https://www.warcraftlogs.com/help/start/">upload your own logs</a> or change the existing logs to the
              {' '}<i>unlisted</i> privacy option instead.
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <h2>Analyze report</h2>
            </div>
            <div className="panel-body">
              <strong>Enter your Warcraft Logs report code.</strong><br />
              https://www.warcraftlogs.com/reports/<input type="text" name="code" className="form-control" ref={(elem) => {
              this.codeInput = elem;
            }} style={{ width: 175 }} placeholder="Report code" autoCorrect="off" autoCapitalize="off" spellCheck="false" />/<br /><br />

              <button type="submit" className="btn btn-primary">
                Start <span className="glyphicon glyphicon-chevron-right" aria-hidden="true" />
              </button>
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

          <div className="text-muted">
            Created by Zerotorescue for the
            <a href="https://discordapp.com/invite/hammerofwrath">#holy Discord</a>. You can usually find helpful people there.
          </div>
        </form>
      </div>
    );
  }
}

export default ReportSelecter;
