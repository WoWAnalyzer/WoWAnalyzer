import React, { Component } from 'react';

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
              <img src="/mastery-radius.png" alt="Mastery radius" className="pull-right" style={{ margin: 15 }} />
              Use this tool to analyze your performance as a Holy Paladin based on important metrics for the spec.<br /><br />

              You will need a Warcraft Logs report with
                advanced combat logging enabled to start. Private logs can not be used, if your guild has private logs you will have to <a href="https://www.warcraftlogs.com/help/start/">upload your own logs</a> or change the existing logs to the <i>unlisted</i> privacy option instead.
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
              }} style={{ width: 175 }} placeholder="Report code" />/<br /><br />

              <button type="submit" className="btn btn-primary">
                Start <span className="glyphicon glyphicon-chevron-right" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <h2>Changes</h2>
            </div>
            <div className="panel-body">
              <div className="text-muted">
                04-04-2017 - Add an Always Be Casting (ABC) module that checks your <i>Non healing time</i> and dead GCD time (this is shown in the tooltip).<br />
                29-03-2017 - Fixed a bug where Maraad's healing statistic would show 0% healing after getting only 1 Maraad's charge.<br />
                29-03-2017 - Update healing bonuses to the 7.2 values (DoS & Ilterendi nerfs).<br />
                27-03-2017 - Added Maraad's Dying Breath healing statistic.<br />
                27-03-2017 - Added Prydaz and Obsidian Stone Spaulders healing statistic.<br />
                26-03-2017 - Added Chain of Thrayn healing statistic.<br />
                26-03-2017 - Completely refactor the core, rename to Holy Paladin Analyzer.<br />
                25-03-2017 - Added cast ratios statistic.<br />
                24-03-2017 - Added Velen's Future Sight healing statistic.<br />
                22-03-2017 - Fixed an issue where DoS / Ilterendi healing statistics didn't work well with absorbed healing (Chronomatic Anomaly).<br /><br />

                Created by Zerotorescue for the <a href="https://discordapp.com/invite/hammerofwrath">#holy Discord</a>. You can usually find helpful people there.
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default ReportSelecter;
