import { Trans } from '@lingui/macro';
import Changelog from 'interface/Changelog';
import Contributor from 'interface/ContributorButton';
import Icon from 'interface/Icon';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import Modal from 'interface/Modal';
import Panel from 'interface/Panel';
import ReadableListing from 'interface/ReadableListing';
import Background from 'interface/report/images/weirdnelf.png';
import { getBuild, getResultTab } from 'interface/selectors/url/report';
import Tooltip from 'interface/Tooltip';
import Config from 'parser/Config';
import { WCLFight } from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLingui } from '@lingui/react';

interface Props {
  report: Report;
  fight: WCLFight;
  config: Config;
  player: PlayerInfo;
  title: ReactNode;
  children: ReactNode;
  onContinueAnyway: () => void;
  testId?: string;
}

const SupportCheckerIssue = ({
  report,
  fight,
  config: { spec, contributors, changelog },
  player,
  title,
  children,
  onContinueAnyway,
  testId,
}: Props) => {
  const { i18n } = useLingui();
  const location = useLocation();
  const selectedTab = getResultTab(location.pathname);
  const build = getBuild(location.pathname) || undefined;

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
        {spec.specName ? i18n._(spec.specName) : null} {i18n._(spec.className)} is currently being
        maintained by {maintainers}.
      </Trans>
    ) : (
      <em>
        <Trans id="interface.report.supportChecker.unmaintained">
          {spec.specName ? i18n._(spec.specName) : null} {i18n._(spec.className)} is not currently
          being maintained by anyone. :(
        </Trans>
      </em>
    );

  return (
    <Modal id="partial-support" onClose={onContinueAnyway} testId={testId}>
      <Panel title={title}>
        <div className="flex wrapable">
          <div className="flex-main" style={{ minWidth: 400 }}>
            {children}
            <br />
            <br />
            {maintainerStatus}
            <br />
            <br />

            <Tooltip
              content={
                <Trans id="interface.report.supportChecker.tooltip.khadgarApproves">
                  Khadgar approves your bravery
                </Trans>
              }
            >
              <Link
                to={makeAnalyzerUrl(report, fight.id, player.id, selectedTab, build)}
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

      <Panel
        title={<Trans id="supportCheckerIssue.specChangelog">Spec changelog</Trans>}
        pad={false}
      >
        <Changelog includeCore={false} changelog={changelog ?? []} />
      </Panel>
    </Modal>
  );
};

export default SupportCheckerIssue;
