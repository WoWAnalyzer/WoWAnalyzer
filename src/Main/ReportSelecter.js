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
              23-04-2017 - Changed the LotM suggestion to be based on CPM and be much more forgiving.<br />
              21-04-2017 - Added HPS numbers to item healing done. Damaging HS are now included in cast counts. Recommended cast efficiency of CS with CM reduced to 30%. The recommended unused IoL is now adjusted based on if you have CM, DP and/or 4PT19.<br />
              21-04-2017 - Added suggestion/issue importance indicators and show a positive message when there are no major issues.<br />
              20-04-2017 - Since Easter is over bosses will no longer resurrect in the mana graph<dfn data-tip="This may cause issues with bosses that do actually resurrect, but I will fix that once I encounter such a boss.">*</dfn>. All bosses in a fight get shown instead of just the first<dfn data-tip="If boss adds are classified as bosses they will be shown as well. So far this doesn't appear to happen, but I will fix it if I encounter this.">*</dfn>. This should make the boss health for Mythic Botanist work properly.<br />
              19-04-2017 - Added a Mana tab for analyzing your mana usage. This also shows boss health since it is often used as a target for mana levels.<br />
              18-04-2017 - Added Velen's Future Sight to cast efficiency. Fixed the parser crashing instead of showing a descriptive error when selected player doesn't appear in a log. Fixed a crash when buff with stacks expired without ever applying.<br />
              17-04-2017 - Added LotM suggestion when casting it too often, added Divine Protection and BoS to cast efficiency display. Added Divine Purpose proc indicator.<br />
              15-04-2017 - Added Tyr's Deliverance healing contribution.<br />
              15-04-2017 - Added Sacred Dawn healing contribution. Note that (when SD wasn't up before) Sacred Dawn increases the Light of Dawn healing on yourself on the initial cast, but other players get healed for the normal amount without the SD healing increase. The calculation is aware of this.<br />
              15-04-2017 - Cast efficiency now takes the extra amount of fight time you had to cast an ability into consideration (e.g. a single cast of 3 minute cooldown during a 3:30 fight will have a higher cast efficiency than during a 5:30 fight).<br />
              15-04-2017 - Added a <b>Talents</b> tab.<br />
              14-04-2017 - Added <b>Suggestions</b> which will give you (way too many) suggestions to improve. This may need to be tuned a bit; any feedback in that regard is welcome. Moved <i>Cast efficiency</i> and <i>Mastery effectiveness player breakdown</i> to separate tabs.<br />
              11-04-2017 - Added Rule of Law to cast efficiency and grouped spells by category.<br />
              10-04-2017 - Show an error when parsing crashes (usually caused by not having advanced combat logging on). Renamed Casts Per Minute to Cast Efficiency. Show absolute amount of casts in Cast Efficiency. Added Arcane Torrent to Cast Efficiency (only shown if you cast it at least once).<br />
              09-04-2017 - Added <i>Casts Per Minute</i> table with very basic recommendations.<br />
              08-04-2017 - Added <i>Heals on beacon</i> statistic.<br />
              08-04-2017 - Added Wowhead tooltips and show T19 4 set bonus gain.<br />
              08-04-2017 - Added Beacon of the Lightbringer mastery radius support!<br />
              08-04-2017 - Improve beacon healing tracking accuracy and it now works properly with Beacon of Virtue.<br />
              08-04-2017 - Total healing done count now includes absorbed healing.<br />
              07-04-2017 - New layout with many usability improvements!<br />
              04-04-2017 - Add an Always Be Casting (ABC) module that checks your
              <i>Non healing time</i> and dead GCD time (this is shown in the tooltip).<br />
              29-03-2017 - Fixed a bug where Maraad's healing statistic would show 0% healing after getting only 1 Maraad's charge.<br />
              29-03-2017 - Update healing bonuses to the 7.2 values (DoS & Ilterendi nerfs).<br />
              27-03-2017 - Added Maraad's Dying Breath healing statistic.<br />
              27-03-2017 - Added Prydaz and Obsidian Stone Spaulders healing statistic.<br />
              26-03-2017 - Added Chain of Thrayn healing statistic.<br />
              26-03-2017 - Completely refactor the core, rename to Holy Paladin Analyzer.<br />
              25-03-2017 - Added cast ratios statistic.
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
