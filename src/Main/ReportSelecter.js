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
      <div style={{ background: '#eee', margin: '15px auto', border: '1px solid #ddd', borderRadius: 5, maxWidth: 600, padding: 15 }}>
        <form onSubmit={this.handleSubmit}>
          <h1 style={{ marginTop: 0 }}>Parse your report</h1>

          <strong>Enter your Warcraft Logs report code.</strong><br />
          https://www.warcraftlogs.com/reports/<input type="text" name="code" ref={(elem) => { this.codeInput = elem; }} />/<br /><br />

          Enter your API key: <input type="text" name="apiKey" ref={(elem) => { this.apiKeyInput = elem; }} value={apiKey} /> (this is temporary)<br />
          <a href="#" onClick={() => this.setState({ apiKeyInfoExpanded: !this.state.apiKeyInfoExpanded })}>Click here to learn how to get one.</a><br />
          {this.state.apiKeyInfoExpanded && (
            <div style={{ paddingTop: 5, paddingRight: 15, paddingBottom: 5, background: '#c2d4e0', borderRadius: 5 }}>
              <ol>
                <li><a href="https://www.warcraftlogs.com/accounts/newuser/">Make an account at Warcraft Logs.</a></li>
                <li>Login.</li>
                <li><a href="https://www.warcraftlogs.com/accounts/changeuser">Open settings.</a><br /><img src="./config-link.png" style={{ maxWidth: '100%' }} alt="Settings link" /></li>
                <li>Scroll down and copy the public API key.<br /><img src="./api-key.png" style={{ maxWidth: '100%' }} alt="API keys" /></li>
              </ol>
            </div>
          )}

          <input type="submit" value="Continue" />

          <br /><br />

          <font color="red">Currently only accurate with Beacon of Faith and when there is only 1 Paladin healing.</font>
        </form>
      </div>
    );
  }
}

export default ReportSelecter;
