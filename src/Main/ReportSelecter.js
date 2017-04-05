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
      <div style={{ width: 650 }}>
        <form onSubmit={this.handleSubmit} className="form-inline">
          <h1>Analyze your Holy Paladin</h1>

          Use this tool to analyze your performance as a Holy Paladin based on relevant metrics. You will need a Warcraft Logs report with
          advanced combat logging enabled to start.<br /><br />

          <strong>Enter your Warcraft Logs report code.</strong><br />
          https://www.warcraftlogs.com/reports/<input type="text" name="code" className="form-control" ref={(elem) => {
            this.codeInput = elem;
          }} style={{ width: 175 }} />/<br /><br />

          <button type="submit" className="btn btn-primary">
            Continue <span className="glyphicon glyphicon-chevron-right" aria-hidden="true" />
          </button><br /><br />

          <div className="text-muted">
            Created by Zerotorescue for the <a href="https://discordapp.com/invite/hammerofwrath">#holy Discord</a>. You can usually find helpful people there.<br /><br />

            <strong>Changes:</strong><br />
            04-04-2017 - Add an Always Be Casting (ABC) module that checks your <i>Non healing time</i> and dead GCD time (this is shown in the tooltip).<br />
            29-03-2017 - Fixed a bug where Maraad's healing statistic would show 0% healing after getting only 1 Maraad's charge.<br />
            29-03-2017 - Update healing bonuses to the 7.2 values (DoS & Ilterendi nerfs).<br />
            27-03-2017 - Added Maraad's Dying Breath healing statistic.<br />
            27-03-2017 - Added Prydaz and Obsidian Stone Spaulders healing statistic.<br />
            26-03-2017 - Added Chain of Thrayn healing statistic.<br />
            26-03-2017 - Completely refactor the core, rename to Holy Paladin Analyzer.<br />
            25-03-2017 - Added cast ratios statistic.<br />
            24-03-2017 - Added Velen's Future Sight healing statistic.<br />
            22-03-2017 - Fixed an issue where DoS / Ilterendi healing statistics didn't work well with absorbed healing (Chronomatic Anomaly).
          </div>
        </form>
      </div>
    );
  }
}

export default ReportSelecter;
