import React, { Component } from 'react';

import AVAILABLE_CONFIGS from 'Parser/AVAILABLE_CONFIGS';

import PatreonLink from './PatreonLink';
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
        <h1>Analyze your performance</h1>

        <div className="row">
          <div className="col-md-6">
            <div className="panel">
              <div className="panel-heading">
                <h2>The World of Warcraft Analyzer</h2>
              </div>
              <div className="panel-body">
                <img src="./img/mastery-radius.png" alt="Mastery radius" className="pull-right" style={{ margin: 15 }} />
                Use this tool to analyze your performance based on important metrics for the spec.<br /><br />

                You will need a Warcraft Logs report with advanced combat logging enabled to start. Private logs can not be used, if your guild has private logs you will have to
                {' '}<a href="https://www.warcraftlogs.com/help/start/">upload your own logs</a> or change the existing logs to the
                {' '}<i>unlisted</i> privacy option instead.<br /><br />

                Feature requests (<dfn data-tip="Provided that you're not using one of Microsoft's browsers.">and bug reports*</dfn>) are welcome!{' '}
                <i>@Zerotorescue</i> on <a href="https://discordapp.com/invite/hammerofwrath">Discord</a> or create an issue{' '}
                <a href={`https://github.com/MartijnHols/WoWAnalyzer/issues`}>here</a>.
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
                <h2>About</h2>
              </div>
              <div className="panel-body text-muted">
                Full source is available on <a href="https://github.com/MartijnHols/WoWAnalyzer">GitHub</a>. Contributions are extremely welcome! Add your own module or spec if you want to be able to analyze something not yet available. The repository contains information on how to contribute, if you need any more information please join our Discord (link further below).<br /><br />

                The following specs are available:<br />
                <ul>
                  {AVAILABLE_CONFIGS.map((config) => (
                    <li><span className={config.spec.className}>{config.spec.specName} {config.spec.className}</span> maintained by <span style={{ color: '#fff' }}>{config.maintainer}</span></li>
                  ))}
                </ul>
                There are no plans at this time to add support for other specs. The best way to get support for a spec is to add it yourself. Adding specs is easy if you're familiar with JavaScript (ES6), see <a href="https://github.com/MartijnHols/WoWAnalyzer">GitHub</a> and the WoW Analyzer Discord for more information.<br /><br />

                If you're looking to help out development in other ways, please consider donating.<br />

                <PatreonLink />
              </div>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <h2>Discord</h2>
              </div>
              <div className="panel-body text-muted">
                I believe it's important to keep class discussion as much in class Discords as possible, so if you have spec specific questions and/or suggestions please try to discuss them in your class Discord (class Discords mods approve of this message <img src="./img/ok_hand.png" alt=":ok_hand:" style={{ height: '1.5em' }} />). The WoW Analyzer Discord is for more general questions and developers looking to contribute.<br /><br />

                <iframe src="https://discordapp.com/widget?id=316864121536512000&theme=dark" width="100%" height="300" allowtransparency="true" frameborder="0" style={{ border: 0 }} />
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
                    <img src="./img/items.png" style={{ maxWidth: '100%', border: '1px solid black', borderRadius: 5 }} alt="Item performance breakdowns" /><br />
                    Item performance breakdowns
                  </div>
                  <div className="col-md-6 text-center">
                    <img src="./img/suggestions.png" style={{ maxWidth: '100%', border: '1px solid black', borderRadius: 5 }} alt="Suggestions for improvement" /><br />
                    Suggestions for improvement
                  </div>
                </div>
                <div className="row" style={{ marginTop: 15 }}>
                  <div className="col-md-6 text-center">
                    <img src="./img/important-metrics.png" style={{ maxWidth: '100%', border: '1px solid black', borderRadius: 5 }} alt="Important metrics" /><br />
                    Important metrics
                  </div>
                  <div className="col-md-6 text-center">
                    <img src="./img/mana-breakdown.png" style={{ maxWidth: '100%', border: '1px solid black', borderRadius: 5 }} alt="Mana breakdown" /><br />
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
