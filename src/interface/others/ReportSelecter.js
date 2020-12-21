import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { Trans, t } from '@lingui/macro';

import REGION_CODES from 'common/REGION_CODES';
import Tooltip from 'common/Tooltip';

import './ReportSelecter.css';

export function getReportCode(input) {
  const match = input.trim().match(/^(.*reports\/)?((?:[a:]{2})([a-zA-Z0-9]{16})|([a-zA-Z0-9]{16}))\/?(#.*)?$/);
  return match && match[2];
}

export function getFight(input){
  const match = input.trim().match(/fight=([^&]*)/);
  return match && match[1];
}

export function getPlayer(input) {
  const match = input.trim().match(/source=([^&]*)/);
  return match && match[1];
}

export function getCharacterFromWCLUrl(input) {
  const match = input.trim().match(/^(.*character\/)(\S*)\/(\S*)\/(\S*)/);
  return match && {
    region: match[2],
    realm: match[3],
    name: match[4].split('#')[0],
  };
}

export function getCharacterFromBattleNetUrl(input) {
  const match = input.trim().match(/^(.*)\/([A-Za-z]{2}-[A-Za-z]{2})\/(character)\/(\S*)\/(\S*)/);
  return match && REGION_CODES[match[2]] && {
    region: REGION_CODES[match[2]],
    realm: match[4],
    name: match[5].split('#')[0],
  };
}

export function constructURL(value){
  const code = getReportCode(value);
  const fight = getFight(value);
  const player = getPlayer(value);
  const character = getCharacterFromWCLUrl(value) || getCharacterFromBattleNetUrl(value);
  if (character) {
    const constructedUrl = `/character/${character.region}/${character.realm}/${character.name}`;
    return constructedUrl;
  }

  if (code) {
    let constructedUrl = `/report/${code}`;

    if (fight) {
      constructedUrl += `/${fight}`;

      if (player) {
        constructedUrl += `/${player}`;
      }
    }

    return constructedUrl;
  }

  return false;
}

class ReportSelecter extends React.PureComponent {
  static propTypes = {
    push: PropTypes.func.isRequired,
  };

  codeInput = null;
  constructor() {
    super();
    this.codeInput = React.createRef();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    if (this.codeInput.current) {
      this.codeInput.current.focus();
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const code = this.codeInput.current.value;

    if (!code) {
      // eslint-disable-next-line no-alert
      alert('Enter a report first.');
      return;
    }

    this.handleCodeInputChange(code);
  }
  handleChange(e) {
    this.handleCodeInputChange(this.codeInput.current.value);
  }
  handleCodeInputChange(value) {
    const constructedURL = constructURL(value);
    constructedURL && this.props.push(constructedURL);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} className="form-inline">
        <div className="report-selector">
          <Tooltip
            content={(
              <Trans id="interface.others.reportSelecter.tooltip.supportedLinks">
                Supported links:<br />
                <ul>
                  <li>https://www.warcraftlogs.com/reports/&lt;report code&gt;</li>
                  <li>https://www.warcraftlogs.com/character/&lt;region&gt;/&lt;realm&gt;/&lt;name&gt;</li>
                  <li>https://worldofwarcraft.com/&lt;language-code&gt;/character/&lt;realm&gt;/&lt;name&gt;</li>
                  <li>https://www.wowchina.com/&lt;language-code&gt;/character/&lt;realm&gt;/&lt;name&gt;</li>
                </ul>
              </Trans>
            )}
          >
            {/*the div needs to be there (previously the tooltip was on input directly) because input sets its own ref and Tooltip would overwrite it*/}
            <div style={{ flex: '1 1', cursor: 'help', padding: 0 }}>
              <input
                data-delay-show="200"
                type="text"
                name="code"
                className="form-control"
                style={{ width: '100%', height: '100%' }}
                ref={this.codeInput}
                onChange={this.handleChange}
                placeholder={t({
                  id: "interface.others.reportSelecter.placeholder",
                  message: `https://www.warcraftlogs.com/reports/<report code>`
                })}
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
          </Tooltip>

          <button type="submit" className="btn btn-primary analyze">
            <Trans id="interface.others.reportSelecter.analyze">Analyze</Trans> <span className="glyphicon glyphicon-chevron-right" aria-hidden />
          </button>
        </div>
      </form>
    );
  }
}

export default connect(null, {
  push,
})(ReportSelecter);
