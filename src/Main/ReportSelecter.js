import React, { Component } from 'react';

class ReportSelecter extends Component {
  static propTypes = {
    apiKey: React.PropTypes.string,
    onSubmit: React.PropTypes.func.isRequired,
  };

  codeInput = null;
  apiKeyInput = null;

  constructor() {
    super();
    this.state = {
      apiKeyInfoExpanded: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.codeInput.focus();
  }

  handleSubmit(e) {
    const { onSubmit } = this.props;

    e.preventDefault();

    const code = this.codeInput.value;
    const apiKey = this.apiKeyInput.value;

    if (!code || !apiKey) {
      alert('Enter a code and API key. I can\'t help you without.');
      return;
    }

    onSubmit(apiKey, code);
  }

  render() {
    const { apiKey } = this.props;

    return (
      <form onSubmit={this.handleSubmit} className="form-inline">
        <h1>Calculate your mastery effectiveness</h1>

        <img src="./mastery.png" className="pull-right" style={{ margin: 5 }} alt="Mastery: Lightbringer" />
        As a Holy Paladin your mastery causes your spells to heal more the closer you are to your target. Use this tool to calculate your actual mastery effectiveness from a Warcraft Logs report.<br /><br />

        <strong>Enter your Warcraft Logs report code.</strong><br />
        https://www.warcraftlogs.com/reports/<input type="text" name="code" className="form-control" ref={(elem) => {
        this.codeInput = elem;
      }} style={{ width: 175 }} />/<br /><br />

        <strong>Enter your API key</strong><br />
        Public API key: <input type="text" name="apiKey" className="form-control" ref={(elem) => {
        this.apiKeyInput = elem;
      }} defaultValue={apiKey} style={{ width: 250 }} />{' '}
        <a href="#" onClick={() => this.setState({ apiKeyInfoExpanded: !this.state.apiKeyInfoExpanded })}>Click here to learn how to get one.</a><br />
        {this.state.apiKeyInfoExpanded && (
          <div className="alert alert-info" style={{ marginTop: 10 }}>
            In order to be able to access your logs we need an API key. You can easily get one yourself with a Warcraft Logs account. Do
            note that an API key still only gives you access to public and unlisted logs; private logs can not be parsed.<br /><br />

            <ol>
              <li><a href="https://www.warcraftlogs.com/accounts/newuser/">Make an account at Warcraft Logs.</a></li>
              <li>Login.</li>
              <li>
                <a href="https://www.warcraftlogs.com/accounts/changeuser">Open settings.</a><br /><img src="./config-link.png" style={{ maxWidth: '100%' }} alt="Settings link" />
              </li>
              <li>Scroll down and copy the public API key.<br /><img src="./api-key.png" style={{ maxWidth: '100%' }} alt="API keys" />
              </li>
            </ol>
          </div>
        )}<br />

        <button type="submit" className="btn btn-primary">
          Continue <span className="glyphicon glyphicon-chevron-right" aria-hidden="true" />
        </button><br /><br />

        <div className="alert alert-danger">
          This tool is currently only accurate with{' '}
          <a href="http://www.wowhead.com/spell=156910/beacon-of-faith">Beacon of Faith</a>. If
          you run this on a log with <a href="http://www.wowhead.com/spell=197446/beacon-of-the-lightbringer">Beacon of the
          Lightbringer</a> it will calculate your mastery effectiveness without taking the beacon radius into consideration.
        </div>

        <div className="text-muted">
          Created by Zerotorescue for the #holy Discord. You can usually find helpful people there.
        </div>
      </form>
    );
  }
}

export default ReportSelecter;
