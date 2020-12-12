import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Trans, t } from '@lingui/macro';
import { useHistory } from 'react-router-dom';

import REGION_CODES from 'common/REGION_CODES';
import Tooltip from 'common/Tooltip';

import './ReportSelecter.css';

export function getReportCode(input: string) {
  const match = input.trim().match(/^(.*reports\/)?((?:[a:]{2})([a-zA-Z0-9]{16})|([a-zA-Z0-9]{16}))\/?(#.*)?$/);
  return match && match[2];
}

export function getFight(input: string) {
  const match = input.trim().match(/fight=([^&]*)/);
  return match && match[1];
}

export function getPlayer(input: string) {
  const match = input.trim().match(/source=([^&]*)/);
  return match && match[1];
}

export function getCharacterFromWCLUrl(input: string) {
  const match = input.trim().match(/^(.*character\/)(\S*)\/(\S*)\/(\S*)/);
  return (
    match && {
      region: match[2],
      realm: match[3],
      name: match[4].split('#')[0],
    }
  );
}

export function getCharacterFromBattleNetUrl(input: string) {
  const match = input.trim().match(/^(.*)\/([A-Za-z]{2}-[A-Za-z]{2})\/(character)\/(\S*)\/(\S*)/);
  return (
    match &&
    REGION_CODES[match[2]] && {
      region: REGION_CODES[match[2]],
      realm: match[4],
      name: match[5].split('#')[0],
    }
  );
}

export function constructURL(value: string) {
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

const ReportSelecter = () => {
  const [reportCode, setReportCode] = useState<string>('');
  const reportCodeRef = useRef<HTMLInputElement>(null);
  const { push } = useHistory();
  useEffect(() => {
    reportCodeRef.current?.focus();
  }, []);

  const processCode = useCallback(
    (reportCode: string) => {
      const constructedURL = constructURL(reportCode);
      if (!constructedURL) {
        return;
      }

      push(constructedURL);
    },
    [push],
  );

  useEffect(() => {
    processCode(reportCode);
  }, [processCode, reportCode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!reportCode) {
      // eslint-disable-next-line no-alert
      alert('Enter a report first.');
      return;
    }

    processCode(reportCode);
  };

  return (
    <form onSubmit={handleSubmit} className="form-inline">
      <div className="report-selector">
        <Tooltip
          content={
            <Trans id="interface.reportSelecter.reportSelecter.tooltip.supportedLinks">
              Supported links:
              <br />
              <ul>
                <li>https://www.warcraftlogs.com/reports/&lt;report code&gt;</li>
                <li>
                  https://www.warcraftlogs.com/character/&lt;region&gt;/&lt;realm&gt;/&lt;name&gt;
                </li>
                <li>
                  https://worldofwarcraft.com/&lt;language-code&gt;/character/&lt;realm&gt;/&lt;name&gt;
                </li>
                <li>
                  https://www.wowchina.com/&lt;language-code&gt;/character/&lt;realm&gt;/&lt;name&gt;
                </li>
              </ul>
            </Trans>
          }
        >
          {/*the div needs to be there (previously the tooltip was on input directly) because input sets its own ref and Tooltip would overwrite it*/}
          <div style={{ flex: '1 1', cursor: 'help', padding: 0 }}>
            <input
              data-delay-show="200"
              type="text"
              name="code"
              className="form-control"
              style={{ width: '100%', height: '100%' }}
              ref={reportCodeRef}
              onChange={e => setReportCode(e.target.value)}
              value={reportCode}
              placeholder={t({
                id: "interface.reportSelecter.reportSelecter.placeholder",
                message: `https://www.warcraftlogs.com/reports/<report code>`
              })}
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>
        </Tooltip>

        <button type="submit" className="btn btn-primary analyze">
          <Trans id="interface.reportSelecter.reportSelecter.button">Analyze</Trans> <span className="glyphicon glyphicon-chevron-right" aria-hidden />
        </button>
      </div>
    </form>
  );
};

export default ReportSelecter;
