import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

class ReportSelecter extends Component {
  static propTypes = {
    push: PropTypes.func.isRequired,
  };

  static getCode(input) {
    const match = input.trim().match(/^(.*reports\/)?([a-zA-Z0-9]{16})\/?(#.*)?$/);
    return match && match[2];
  }
  static getFight(input) {
    const match = input.trim().match(/fight=([^&]*)/);
    return match && match[1];
  }
  static getPlayer(input) {
    const match = input.trim().match(/source=([^&]*)/);
    return match && match[1];
  }

  codeInput = null;

  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    if (this.codeInput) {
      this.codeInput.focus();
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const code = this.codeInput.value;

    if (!code) {
      // eslint-disable-next-line no-alert
      alert('Enter a report first.');
      return;
    }

    this.handleCodeInputChange(code);
  }
  handleChange(e) {
    this.handleCodeInputChange(this.codeInput.value);
  }
  handleCodeInputChange(value) {
    const code = this.constructor.getCode(value);
    const fight = this.constructor.getFight(value);
    const player = this.constructor.getPlayer(value);

    if (code) {
      let constructedUrl = `report/${code}`;

      if (fight) {
        constructedUrl += `/${fight}`;

        if (player) {
          constructedUrl += `/${player}`;
        }
      }

      this.props.push(constructedUrl);
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} className="form-inline">
        <div className="report-selector">
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
      </form>
    );
  }
}

export default connect(null, {
  push,
})(ReportSelecter);
