import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import REGION_CODES from 'common/REGION_CODES';

import './ReportSelecter.css';

class ReportSelecter extends React.PureComponent {
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
  static getCharacterFromWCLUrl(input) {
    const match = input.trim().match(/^(.*character\/)(\S*)\/(\S*)\/(\S*)/);
    return match && {
      region: match[2],
      realm: match[3],
      name: match[4],
    };
  }
  static getCharacterFromBattleNetUrl(input) {
    const match = input.trim().match(/^(.*)\/([A-Za-z]{2}-[A-Za-z]{2})\/(character)\/(\S*)\/(\S*)/);
    return match && {
      region: REGION_CODES[match[2]],
      realm: match[4],
      name: match[5],
    };
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
    const character = this.constructor.getCharacterFromWCLUrl(value) || this.constructor.getCharacterFromBattleNetUrl(value);

    if (character) {
      const constructedUrl = `character/${character.region}/${character.realm}/${character.name}`;
      this.props.push(constructedUrl);
    }

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
            data-tip={`
              Parsable links:<br/>
              <ul>
                <li>https://www.warcraftlogs.com/reports/&lt;report code&gt;</li>
                <li>https://www.warcraftlogs.com/character/&lt;region&gt;/&lt;realm&gt;/&lt;name&gt;</li>
                <li>https://worldofwarcraft.com/&lt;language-code&gt;/character/&lt;realm&gt;/&lt;name&gt;</li>
              </ul>
            `}
            data-delay-show="200"
            type="text"
            name="code"
            className="form-control"
            ref={elem => {
              this.codeInput = elem;
            }}
            onChange={this.handleChange}
            style={{ width: 360, cursor: 'help' }}
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
