import React, { Component } from 'react';
import PropTypes from 'prop-types';

import PatreonButton from './PatreonButton';
import GithubButton from './GithubButton';
import DiscordButton from './DiscordButton';

class ReportSelecter extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
  };

  static getCode(input) {
    const match = input.trim().match(/^(.*reports\/)?([a-zA-Z0-9]{16})\/?(#.*)?$/);

    return match && match[2];
  }

  codeInput = null;

  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.codeInput.focus();
  }

  handleSubmit(e) {
    e.preventDefault();

    const code = this.codeInput.value;

    if (!code) {
      alert('Enter the report code.');
      return;
    }

    this.handleCodeInputChange(code);
  }
  handleChange(e) {
    this.handleCodeInputChange(this.codeInput.value);
  }
  handleCodeInputChange(value) {
    const code = this.constructor.getCode(value);
    if (code) {
      this.props.onSubmit(code);
    }
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
                  onChange={this.handleChange}
                  style={{ width: 175 }}
                  placeholder="report code"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />/

                <button type="submit" className="btn btn-primary analyze">
                  Analyze <span className="glyphicon glyphicon-chevron-right" aria-hidden />
                </button>
              </div>
              <div className="col-md-12 col-lg-5 text-right">
                <DiscordButton style={{ marginLeft: 20 }} />
                <PatreonButton style={{ marginLeft: 20 }} />
                <GithubButton style={{ marginLeft: 20 }} />
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default ReportSelecter;
