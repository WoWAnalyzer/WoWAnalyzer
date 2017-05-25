import React, { Component } from 'react';

import AVAILABLE_CONFIGS from 'Parser/AVAILABLE_CONFIGS';

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

                If you're looking to help out development in other ways, <dfn data-tip="Please note this Patreon is only for the core WoW Analyzer, and the specs being maintained by me (Holy Paladin and Disc Priest at the time of writing). The other specs are being developed by other people on top of the core I built, please contact them if you would prefer supporting them specifically. There is currently no distribution of donations in place, and due to the complex nature of this there are currently no plans to do this either. It sucks and I'm sorry.">please consider donating</dfn>.<br />

                <a
                  className="become-patron-button"
                  role="button"
                  href="https://www.patreon.com/wowanalyzer">
              <span className="patreon-icon">
                <svg viewBox="0 0 8 8" width="12px" height="12px" fill="#fff"><path d="M2.32061871,0.367894189 C3.18961652,-0.0376047918 4.20711396,-0.109604611 5.12711165,0.16039471 C5.93360962,0.39539412 6.6591078,0.894392865 7.17010651,1.55889119 C7.67510524,2.21138955 7.96860451,3.02288751 7.99660444,3.84638544 C8.03210435,4.6978833 7.78560497,5.55788114 7.30110618,6.25987938 C6.59110797,7.31187673 5.35311108,7.98687503 4.07861429,7.999375 C3.44061589,8.000375 2.80261749,7.999875 2.1651191,7.999375 C2.17011908,6.65887837 2.1656191,5.31838174 2.16811909,3.97788511 C2.17011908,3.47138639 2.39811851,2.97288764 2.77711756,2.63638849 C3.13911665,2.30838931 3.6371154,2.13588974 4.12461417,2.17238965 C4.6291129,2.20338957 5.11311169,2.45838893 5.42761089,2.85238794 C5.75061008,3.24938694 5.89160973,3.7853856 5.80860994,4.29038433 C5.72761014,4.82138299 5.39511098,5.30638177 4.93061214,5.57838109 C4.39361349,5.90388027 3.69011526,5.91288025 3.13711665,5.61888099 C3.13761665,6.05337989 3.13661665,6.4883788 3.13761665,6.92337771 C3.63111541,7.06737734 4.15961408,7.09187728 4.66161282,6.97737757 C5.40461095,6.81487798 6.07610926,6.35987912 6.50610818,5.73538069 C6.91610715,5.14988217 7.10560668,4.41738401 7.03460685,3.70738579 C6.97460701,3.05588743 6.69410771,2.42788901 6.25160882,1.94539022 C5.84160985,1.49439136 5.29311123,1.16939217 4.69811273,1.03189252 C4.01411445,0.869392928 3.27411631,0.952892718 2.64611789,1.26789193 C1.6451204,1.7543907 0.962622121,2.82088802 0.952122147,3.93238523 C0.950122152,5.28788182 0.951622148,6.64337841 0.95112215,7.999375 C0.634622945,8.000375 0.317623743,7.999875 0.000124540763,7.999875 C0.000124540763,6.67387833 0.000624539506,5.34838167 0.000124540763,4.022885 C-0.00437544792,3.45688642 0.113124257,2.89038785 0.344123676,2.37338915 C0.7321227,1.49639135 1.4476209,0.769393179 2.32061871,0.367894189" /></svg>
              </span>
                  {' '}Become a patron
                </a>
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
