import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Trans } from '@lingui/macro';

import PATCHES from 'common/PATCHES';
import Icon from 'common/Icon';
import Tooltip from 'common/Tooltip';
import DiscordButton from 'interface/common/thirdpartybuttons/Discord';
import GitHubButton from 'interface/common/thirdpartybuttons/GitHub';
import { ignorePreviousPatchWarning } from 'interface/actions/previousPatch';
import { getReportCodesIgnoredPreviousPatchWarning } from 'interface/selectors/skipPreviousPatchWarning';

import Background from './images/weirdnelf.png';

class PatchChecker extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    report: PropTypes.object.isRequired,
    ignorePreviousPatchWarning: PropTypes.func.isRequired,
    ignored: PropTypes.array.isRequired,
  };

  constructor() {
    super();
    this.handleClickContinue = this.handleClickContinue.bind(this);
  }

  handleClickContinue() {
    // I chose on purpose not to store this in a cookie since I don't want this to be forgotten. It should not be a big deal if this happens every time the page is loaded, so long as it isn't shown every fight.
    this.props.ignorePreviousPatchWarning(this.props.report.code);
  }

  makePreviousPatchUrl(patch) {
    return `${window.location.protocol}//${patch.urlPrefix}.${window.location.host}${window.location.pathname}`;
  }

  get continue() {
    return this.props.ignored.includes(this.props.report.code);
  }

  render() {
    const { children, report } = this.props;

    const reportTimestamp = report.start;
    const reportDate = new Date(report.start).toString();

    // Sort from latest to oldest
    const orderedPatches = PATCHES.sort((a, b) => b.timestamp - a.timestamp);

    const expansionStartPatch = orderedPatches[orderedPatches.length - 1];
    const reportPatch = orderedPatches.find(patch => reportTimestamp > patch.timestamp);

    if ((reportPatch && reportPatch.isCurrent) || this.continue) {
      return children;
    } else {
      return (
        <div className="container">
        <h1>{`${report.title} - ${reportDate}`}</h1>

          <div className="panel">
            <div className="panel-heading">
              <h2><Trans>{reportTimestamp >= expansionStartPatch.timestamp ? "This report is for an earlier patch" : "Sorry, this report is for a previous expansion" }</Trans></h2>
            </div>
            <div className="panel-body">
              <div className="flex wrapable">
                <div className="flex-main" style={{ minWidth: 400 }}>
                  <>
                  {
                    reportTimestamp >= expansionStartPatch.timestamp ? (
                      <Trans>
                        WoWAnalyzer is constantly being updated to support the latest changes. This can cause some functionality to be modified for the latest talents/traits/trinkets or be removed.
                        <br /><br />
                        This could mean that some parts of your report will no longer be analysed accurately.
                        <br /><br />
                        If you would like to view the analysis on an older version of WoWAnalyzer, please
                        {
                          <a
                            href={this.makePreviousPatchUrl(reportPatch)}
                            onClick={this.handleClickContinue}
                            style={{ fontSize: '1.1em' }}
                          >
                            <Trans>click here</Trans>
                          </a>
                        }.
                        <br /><br />
                        If you would still like to view the analysis using the latest updates, you can click 'Continue anyway' below.
                      </Trans>
                    ) : (
                      <Trans>
                        Due to the number of class changes since the last expansion (class abilities, talents, etc.), the analysis provided by WoWAnalyzer will most likely be inaccurate.
                        <br />
                        <br />
                        You can still access the Analysis by clicking 'Continue anyway' below if required.
                      </Trans>
                    )
                  }
                  </><br /><br />

                  <div style={{ paddingBottom: '0.5em' }}>
                    <GitHubButton />{' '}
                    <DiscordButton />
                  </div>
                  <Tooltip content="Khadgar approves your bravery">
                    <Link
                      to={window.location.pathname}
                      onClick={this.handleClickContinue}
                      style={{ fontSize: '1.1em' }}
                    >
                      <Icon icon="quest_khadgar" /> <Trans>Continue anyway</Trans>
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
            </div>
          </div>
        </div>
      );
    }
  }
}

const mapStateToProps = state => ({
  ignored: getReportCodesIgnoredPreviousPatchWarning(state),
});
export default connect(mapStateToProps, {
  ignorePreviousPatchWarning,
})(PatchChecker);
