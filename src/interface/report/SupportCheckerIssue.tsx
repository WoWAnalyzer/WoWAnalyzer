import { t, Trans } from '@lingui/macro';
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import Tooltip from 'interface/Tooltip';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import Panel from 'interface/Panel';
import GitHubButton from 'interface/GitHubButton';
import DiscordButton from 'interface/DiscordButton';
import Icon from 'interface/Icon';
import Background from 'interface/report/images/weirdnelf.png';
import Fight from 'parser/core/Fight';
import { Player } from 'parser/core/CombatLogParser';
import ReadableListing from 'interface/ReadableListing';
import Contributor from 'interface/ContributorButton';
import Config from 'parser/Config';
import Changelog from 'interface/Changelog';

interface Props {
  report: unknown;
  fight: Fight;
  config: Config;
  player: Player;
  title: ReactNode;
  children: ReactNode;
  onContinueAnyway: () => void;
}

const SupportCheckerIssue = ({
  report,
  fight,
  config: { spec, contributors, changelog },
  player,
  title,
  children,
  onContinueAnyway,
}: Props) => {
  const maintainers = (
    <ReadableListing>
      {contributors.map((contributor) => (
        <Contributor key={contributor.nickname} {...contributor} />
      ))}
    </ReadableListing>
  );
  const maintainerStatus =
    contributors.length !== 0 ? (
      <Trans id="interface.report.supportChecker.maintainedBy">
        {spec.specName} {spec.className} is currently being maintained by {maintainers}.
      </Trans>
    ) : (
      <em>
        <Trans id="interface.report.supportChecker.unmaintained">
          {spec.specName} {spec.className} is not currently being maintained by anyone. :(
        </Trans>
      </em>
    );

  return (
    <div className="container offset">
      <h1>
        <div className="back-button">
          <Tooltip
            content={t({
              id: 'interface.report.supportChecker.tooltip.backToPlayerSelection',
              message: `Back to player selection`,
            })}
          >
            <Link to={makeAnalyzerUrl(report, fight.id)}>
              <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
            </Link>
          </Tooltip>
        </div>
        <span className={spec.className.replace(' ', '')}>
          {player.name} - {spec.specName} {spec.className}
        </span>
      </h1>

      <Panel title={title}>
        <div className="flex wrapable">
          <div className="flex-main" style={{ minWidth: 400 }}>
            {children}
            <br />
            <br />
            {maintainerStatus}
            <br />
            <br />

            <div style={{ paddingBottom: '1.5em' }}>
              <GitHubButton /> <DiscordButton />
            </div>
            <Tooltip
              content={
                <Trans id="interface.report.supportChecker.tooltip.khadgarApproves">
                  Khadgar approves your bravery
                </Trans>
              }
            >
              <Link
                to={makeAnalyzerUrl(report, fight.id, player.id)}
                onClick={onContinueAnyway}
                style={{ fontSize: '1.2em' }}
              >
                <Icon icon="quest_khadgar" />{' '}
                <Trans id="interface.report.supportChecker.continueAnyway">
                  I want to continue anyway
                </Trans>
              </Link>
            </Tooltip>
          </div>
          <div className="flex-sub">
            <img
              src={Background}
              alt=""
              style={{
                paddingLeft: 15,
                maxWidth: 250,
                marginBottom: -15,
              }}
            />
          </div>
        </div>
      </Panel>

      <h1>
        <Trans id="supportCheckerIssue.specChangelog">Spec changelog</Trans>
      </h1>
      <Changelog includeCore={false} changelog={changelog} />
    </div>
  );
};

export default SupportCheckerIssue;
