import { t, Trans } from '@lingui/macro';
import getFightName from 'common/getFightName';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import OldExpansionWarning from 'interface/report/OldExpansionWarning';
import FightSelectionPanel from 'interface/report/FightSelectionPanel';
import ReportDurationWarning, { MAX_REPORT_DURATION } from 'interface/report/ReportDurationWarning';
import Tooltip from 'interface/Tooltip';
import { ReactNode, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Toggle from 'react-toggle';
import { FightProvider } from 'interface/report/context/FightContext';
import { useReport } from 'interface/report/context/ReportContext';
import { isUnsupportedClassicVersion } from 'game/VERSIONS';
import DocumentTitle from 'interface/DocumentTitle';
import { getFightIdFromParam } from 'interface/selectors/url/report/getFightId';
import { usePageView } from 'interface/useGoogleAnalytics';
import { isPresent } from 'common/typeGuards';
import { useWaDispatch } from 'interface/utils/useWaDispatch';
import { clearFight, setFight } from 'interface/reducers/navigation';
import Report from 'parser/core/Report';

const getFightFromReport = (report: Report, fightId: number) => {
  if (!report.fights) {
    return null;
  }
  return report.fights.find((fight) => fight.id === fightId) || null;
};

interface Props {
  children: ReactNode;
}

const FightSelectionList = () => {
  const [killsOnly, setKillsOnly] = useState(false);
  const { report, refreshReport } = useReport();
  const reportDuration = report.end - report.start;
  usePageView('FightSelectionList');

  return (
    <div className="container offset fight-selection">
      <div className="flex wrapable" style={{ marginBottom: 15 }}>
        <div className="flex-main" style={{ position: 'relative' }}>
          <div className="back-button">
            <Tooltip
              content={t({
                id: 'interface.report.fightSelection.tooltip.backToHome',
                message: `Back to home`,
              })}
            >
              <Link to="/">
                <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
                <label>
                  {' '}
                  <Trans id="interface.report.fightSelection.tooltip.home">Home</Trans>
                </label>
              </Link>
            </Tooltip>
          </div>
          <h1 style={{ lineHeight: 1.4, margin: 0 }}>
            <Trans id="interface.report.fightSelection.fightSelection">Fight selection</Trans>
          </h1>
          <small style={{ marginTop: -5 }}>
            <Trans id="interface.report.fightSelection.fightSelectionDetails">
              Select the fight you wish to analyze. If a boss or encounter is missing, or the list
              below is empty, press the Refresh button above to re-pull the log from Warcraft Logs.
              Additionally, please note that due to the way combat logs work, we are unable to
              evaluate Target Dummy logs.
            </Trans>
          </small>
        </div>
        <div className="flex-sub">
          <div>
            <Tooltip
              content={
                <Trans id="interface.report.fightSelection.tooltip.refreshFightsList">
                  This will refresh the fights list which can be useful if you're live logging.
                </Trans>
              }
            >
              <Link to={makeAnalyzerUrl(report)} onClick={refreshReport}>
                <span className="glyphicon glyphicon-refresh" aria-hidden="true" />{' '}
                <Trans id="interface.report.fightSelection.refresh">Refresh</Trans>
              </Link>
            </Tooltip>
            <span className="toggle-control" style={{ marginLeft: 5 }}>
              <Toggle
                checked={killsOnly}
                icons={false}
                onChange={(event) => setKillsOnly(event.currentTarget.checked)}
                id="kills-only-toggle"
              />
              <label htmlFor="kills-only-toggle">
                {' '}
                <Trans id="interface.report.fightSelection.killsOnly">Kills only</Trans>
              </label>
            </span>
          </div>
        </div>
      </div>

      {isUnsupportedClassicVersion(report.gameVersion) && <OldExpansionWarning />}

      {reportDuration > MAX_REPORT_DURATION && <ReportDurationWarning duration={reportDuration} />}

      {!isUnsupportedClassicVersion(report.gameVersion) && (
        <FightSelectionPanel report={report} killsOnly={killsOnly} />
      )}
    </div>
  );
};

const FightSelection = ({ children }: Props) => {
  const { fightId } = useParams();
  const fightIdAsNumber = getFightIdFromParam(fightId);
  const { report } = useReport();
  const dispatch = useWaDispatch();

  const fight = isPresent(fightIdAsNumber) ? getFightFromReport(report, fightIdAsNumber) : null;

  useEffect(() => {
    if (fight) {
      dispatch(
        setFight({ title: getFightName(report, fight), link: makeAnalyzerUrl(report, fight.id) }),
      );
    } else {
      dispatch(clearFight());
    }
  }, [dispatch, fight, report]);

  useEffect(() => {
    // Scroll to top of page on initial render
    window.scrollTo(0, 0);
  }, []);

  if (!fight) {
    return <FightSelectionList />;
  }

  return (
    <>
      <DocumentTitle
        title={
          fight
            ? t({
                id: 'interface.report.fightSelection.documentTitle',
                message: `${getFightName(report, fight)} in ${report.title}`,
              })
            : report.title
        }
      />
      <FightProvider fight={fight}>{children}</FightProvider>
    </>
  );
};

export default FightSelection;
