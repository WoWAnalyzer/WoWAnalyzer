import { Trans } from '@lingui/macro';
import { ignorePreviousPatchWarning } from 'interface/actions/previousPatch';
import DiscordButton from 'interface/DiscordButton';
import GitHubButton from 'interface/GitHubButton';
import Icon from 'interface/Icon';
import Panel from 'interface/Panel';
import { RootState } from 'interface/reducers';
import { getReportCodesIgnoredPreviousPatchWarning } from 'interface/selectors/skipPreviousPatchWarning';
import Tooltip from 'interface/Tooltip';
import Report from 'parser/core/Report';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { wclGameVersionToExpansion } from 'game/VERSIONS';

import Background from './images/weirdnelf.png';
import PATCHES, { Patch } from './PATCHES';

interface Props {
  children: React.ReactNode;
  report: Report;
  ignorePreviousPatchWarning: (code: string) => void;
  ignored: string[];
}

class PatchChecker extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.handleClickContinue = this.handleClickContinue.bind(this);
  }

  handleClickContinue() {
    // I chose on purpose not to store this in a cookie since I don't want this to be forgotten. It should not be a big deal if this happens every time the page is loaded, so long as it isn't shown every fight.
    this.props.ignorePreviousPatchWarning(this.props.report.code);
  }

  makePreviousPatchUrl(patch: Patch) {
    // Handle the case where we don't need a URL prefix
    // This is specifically for patches within expansion, expansion changes usually merit a prefix
    if (!patch.urlPrefix) {
      return `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    }
    return `${window.location.protocol}//${patch.urlPrefix}.${window.location.host}${window.location.pathname}`;
  }

  get continue() {
    return this.props.ignored.includes(this.props.report.code);
  }

  render() {
    const { children, report } = this.props;

    const reportTimestamp = report.start;
    const reportDate = new Date(report.start).toLocaleDateString();
    const reportGameVersion = report.gameVersion;

    // Only check patches with matching game version
    const patchesForGameVersion = PATCHES.filter((it) => it.gameVersion === reportGameVersion);

    // Sort from latest to oldest
    const orderedPatches = patchesForGameVersion.sort((a, b) => b.timestamp - a.timestamp);

    const reportPatch = orderedPatches.find((patch) => reportTimestamp > patch.timestamp);
    // This will get the expansion expected based on the game version of the report, which
    // _can_ be different from the expansion from the report patch.
    // If they're different, it might be a bug OR the patch might be missing from the patches file.
    const reportExpansion = wclGameVersionToExpansion(report.gameVersion);

    if ((reportPatch && reportPatch.isCurrent) || this.continue) {
      return children;
    } else {
      const isThisExpansion = reportPatch?.expansion === reportExpansion;

      return (
        <div className="container offset">
          <h1>
            {report.title} - {reportDate}
          </h1>

          <Panel
            title={
              isThisExpansion ? (
                <Trans id="interface.report.patchChecker.earlierPatch">
                  This report is for an earlier patch
                </Trans>
              ) : (
                <Trans id="interface.report.patchChecker.previousExpansion">
                  This report is for a previous expansion
                </Trans>
              )
            }
            pad={false}
          >
            <div className="flex wrapable">
              <div className="flex-main pad">
                {isThisExpansion ? (
                  <Trans id="interface.report.patchChecker.viewAnalysisOnOlderVersion">
                    WoWAnalyzer is constantly being updated to support the latest changes. This can
                    cause some functionality to be modified for the latest talents/traits/trinkets
                    or be removed.
                    <br />
                    <br />
                    This could mean that some parts of your report will no longer be analysed
                    accurately.
                    <br />
                    <br />
                    If you would still like to view the analysis using the latest updates, you can
                    click 'Continue anyway' below.
                  </Trans>
                ) : (
                  <Trans id="interface.report.patchChecker.viewAnalysisOldExpansion">
                    Due to the number of class changes since the last expansion (class abilities,
                    talents, etc.), the analysis provided by WoWAnalyzer will most likely be
                    inaccurate.
                    <br />
                    <br />
                    You can still access the Analysis by clicking 'Continue anyway' below if
                    required.
                    <br />
                    <br />
                    If you would like to view the analysis on an older version of WoWAnalyzer,{' '}
                    <a
                      href={reportPatch && this.makePreviousPatchUrl(reportPatch)}
                      onClick={this.handleClickContinue}
                      style={{ fontSize: '1.1em' }}
                    >
                      <Trans id="interface.report.patchChecker.clickHere">click here</Trans>
                    </a>
                    .
                    <br />
                    <br />
                    If you would still like to view the analysis using the latest updates, you can
                    click 'Continue anyway' below.
                  </Trans>
                )}
                <br />
                <br />

                <div style={{ marginBottom: 15 }}>
                  <GitHubButton /> <DiscordButton />
                </div>
                <Tooltip
                  content={
                    <Trans id="interface.report.patchChecker.khadgarApproves">
                      Khadgar approves your bravery
                    </Trans>
                  }
                >
                  <Link
                    to={window.location.pathname}
                    onClick={this.handleClickContinue}
                    style={{ fontSize: '1.1em' }}
                  >
                    <Icon icon="quest_khadgar" />{' '}
                    <Trans id="interface.report.patchChecker.continueAnyway">Continue anyway</Trans>
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
        </div>
      );
    }
  }
}

const mapStateToProps = (state: RootState) => ({
  ignored: getReportCodesIgnoredPreviousPatchWarning(state),
});
export default connect(mapStateToProps, {
  ignorePreviousPatchWarning,
})(PatchChecker);
