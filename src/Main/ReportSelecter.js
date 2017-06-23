import React, { Component } from 'react';
import PropTypes from 'prop-types';

import PatreonLink from './PatreonLink';
import GithubLogo from './Images/GitHub-Mark-32px.png';
import DiscordLogo from './Images/Discord-Logo+Wordmark-White.svg';

const githubUrl = 'https://github.com/MartijnHols/WoWAnalyzer';

class ReportSelecter extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
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
      <div className="report-selector">
        <form onSubmit={this.handleSubmit} className="form-inline">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-lg-7">
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
                />/

                <button type="submit" className="btn btn-primary">
                  Analyze <span className="glyphicon glyphicon-chevron-right" aria-hidden="true" />
                </button>
              </div>
              <div className="col-md-12 col-lg-5 text-right">
                <a
                  className="btn btn-default"
                  role="button"
                  href="https://discord.gg/AxphPxU"
                  style={{ background: '#7289DA', border: 0 }}
                >
                  <img src={DiscordLogo} alt="Discord logo" style={{ height: '2em', marginTop: -1 }} />
                </a>
                <PatreonLink className="btn" text="Patreon" />
                <a
                  className="btn btn-default"
                  role="button"
                  href={githubUrl}
                  style={{ background: '#fff', color: '#000', border: 0, marginRight: 0 }}
                >
                  <img src={GithubLogo} alt="GitHub logo" style={{ height: '1.4em', marginTop: -2 }} /> View on GitHub
                </a>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default ReportSelecter;
