import { Trans, t } from '@lingui/macro';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import REGION_CODES from './REGION_CODES';
import Tooltip from './Tooltip';
import './ReportSelecter.css';

interface ReportSelection {
  code: string;
  fight?: number;
  source?: number;
}

const REPORT_CODE_RE = /^(a:)?([a-zA-Z0-9]{16})$/;

function getReportSelection(input: string): ReportSelection | null {
  if (REPORT_CODE_RE.test(input)) {
    // raw report code
    return {
      code: input,
    };
  }

  try {
    const url = new URL(input);
    const [, directory, maybeReportCode] = url.pathname.split('/');
    if (directory !== 'reports' || !REPORT_CODE_RE.test(maybeReportCode)) {
      return null;
    }
    // definitely a report, try to find the fight/source data
    let fight: number | undefined = undefined;
    let source: number | undefined = undefined;
    // check the hash (old style urls) first
    if (url.hash) {
      const hashComponents = Object.fromEntries(
        url.hash
          .substring(1)
          .split('&')
          .map((component) => component.split('=')),
      );
      if (hashComponents.fight) {
        fight = Number.parseInt(hashComponents.fight);
      }
      if (hashComponents.source) {
        source = Number.parseInt(hashComponents.source);
      }
    }

    // now check the query params (new style urls)
    if (url.searchParams) {
      if (url.searchParams.has('fight')) {
        fight = Number.parseInt(url.searchParams.get('fight')!);
      }
      if (url.searchParams.has('source')) {
        source = Number.parseInt(url.searchParams.get('source')!);
      }
    }

    return {
      code: maybeReportCode,
      fight,
      source,
    };
  } catch {
    return null;
  }
}

export function getReportCode(input: string) {
  return getReportSelection(input)?.code;
}

function getFight(input: string) {
  return getReportSelection(input)?.fight;
}

function getPlayer(input: string) {
  return getReportSelection(input)?.source;
}

function getCharacterFromWCLUrl(input: string) {
  const match = input.trim().match(/^(.*character\/)(\S*)\/(\S*)\/(\S*)/);
  return (
    match && {
      region: match[2],
      realm: match[3],
      name: match[4].split('#')[0],
    }
  );
}

function getCharacterFromBattleNetUrl(input: string) {
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
  const navigate = useNavigate();
  useEffect(() => {
    reportCodeRef.current?.focus();
  }, []);

  const processCode = useCallback(
    (reportCode: string) => {
      const constructedURL = constructURL(reportCode);
      if (!constructedURL) {
        return;
      }

      navigate(constructedURL);
    },
    [navigate],
  );

  useEffect(() => {
    processCode(reportCode);
  }, [processCode, reportCode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!reportCode) {
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
              onChange={(e) => setReportCode(e.target.value)}
              value={reportCode}
              placeholder={t({
                id: 'interface.reportSelecter.reportSelecter.placeholder',
                message: `https://www.warcraftlogs.com/reports/<report code>`,
              })}
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              aria-labelledby="reportSelectionHeader.improveYourPerformance"
            />
          </div>
        </Tooltip>

        <button type="submit" className="btn btn-primary analyze">
          <Trans id="interface.reportSelecter.reportSelecter.button">Analyze</Trans>{' '}
          <span className="glyphicon glyphicon-chevron-right" aria-hidden />
        </button>
      </div>
    </form>
  );
};

export default ReportSelecter;
