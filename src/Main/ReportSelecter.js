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
      <div className="panel panel-default" style={{ background: '#eee', maxWidth: 600, margin: '0 auto' }}>
        <div className="panel-body">
        <form onSubmit={this.handleSubmit} className="form-inline">
          <h1 style={{ marginTop: 0 }}>Parse your report</h1>

          <strong>Enter your Warcraft Logs report code.</strong><br />
          https://www.warcraftlogs.com/reports/<input type="text" name="code" className="form-control" ref={(elem) => { this.codeInput = elem; }} />/<br /><br />

          <strong>Enter your API key</strong> (this is temporary)<br />
          Public key: <input type="text" name="apiKey" className="form-control" ref={(elem) => { this.apiKeyInput = elem; }} defaultValue={apiKey} />{' '}
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
          )}<br />

          <input type="submit" className="btn btn-primary" value="Continue" /><br /><br />

          <div className="alert alert-danger">Currently only accurate with Beacon of Faith. This is still likely to contain bugs and there are no guarantees regarding its accuracy.</div>

          <div className="text-muted">
            Created by Zerotorescue for the #holy Discord. There is currently <b>no support</b> on this tool. If you can't figure it out
            please wait for a release. Feedback regarding accuracy is welcome.
          </div>
        </form>
      </div>
      </div>
    );
  }
}

export default ReportSelecter;
