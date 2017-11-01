import React, { Component } from 'react';
import PropTypes from 'prop-types';

import PatreonButton from './PatreonButton';
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
      // eslint-disable-next-line no-alert
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
              <div className="col-md-12 col-lg-8 report-code-box">
                <span className="hidden-xs">
                  Enter a WCL report link:{' '}
                </span>
                <input
                  type="text"
                  name="code"
                  className="form-control"
                  ref={elem => this.codeInput = elem}
                  onChange={this.handleChange}
                  style={{ width: 360 }}
                  placeholder="https://www.warcraftlogs.com/reports/<report code>"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />

                <button type="submit" className="btn btn-primary analyze">
                  Analyze <span className="glyphicon glyphicon-chevron-right" aria-hidden />
                </button>
              </div>
              <div className="col-md-12 col-lg-4 external-links text-right">
                <DiscordButton />
                <PatreonButton />
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default ReportSelecter;
