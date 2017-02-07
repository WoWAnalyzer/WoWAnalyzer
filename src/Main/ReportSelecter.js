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
          <h1>Calculate your mastery effectiveness</h1>

          <img src="./mastery.png" className="pull-right" style={{ margin: 5 }} alt="Mastery: Lightbringer" />
          As a Holy Paladin your mastery causes your spells to heal more the closer you are to your target. Use this tool to calculate your actual mastery effectiveness from a Warcraft Logs report.<br /><br />

          <strong>Enter your Warcraft Logs report code.</strong><br />
          https://www.warcraftlogs.com/reports/<input type="text" name="code" className="form-control" ref={(elem) => {
            this.codeInput = elem;
          }} style={{ width: 175 }} />/<br /><br />

          <button type="submit" className="btn btn-primary">
            Continue <span className="glyphicon glyphicon-chevron-right" aria-hidden="true" />
          </button><br /><br />

          <div className="alert alert-danger">
            This tool is currently only accurate with{' '}
            <a href="http://www.wowhead.com/spell=156910/beacon-of-faith">Beacon of Faith</a>. If
            you run this on a log with <a href="http://www.wowhead.com/spell=197446/beacon-of-the-lightbringer">Beacon of the
            Lightbringer</a> it will calculate your mastery effectiveness without taking the beacon radius into consideration.<br />
            Effects that temporarily increase your mastery are also currently not supported.
          </div>

          <div className="text-muted">
            Created by Zerotorescue for the #holy Discord. You can usually find helpful people there.
          </div>
        </form>
      </div>
    );
  }
}

export default ReportSelecter;
