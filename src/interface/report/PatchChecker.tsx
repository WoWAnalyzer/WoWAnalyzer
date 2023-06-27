
import { ignorePreviousPatchWarning } from 'interface/actions/previousPatch';
import DiscordButton from 'interface/DiscordButton';
import GitHubButton from 'interface/GitHubButton';
import Icon from 'interface/Icon';
import Panel from 'interface/Panel';
import Tooltip from 'interface/Tooltip';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { wclGameVersionToExpansion } from 'game/VERSIONS';
import { useReport } from 'interface/report/context/ReportContext';

import Background from './images/weirdnelf.png';
import PATCHES, { Patch } from './PATCHES';
import { useWaDispatch } from 'interface/utils/useWaDispatch';
import { useWaSelector } from 'interface/utils/useWaSelector';
import { usePageView } from 'interface/useGoogleAnalytics';
import Expansion from 'game/Expansion';

const makePreviousPatchUrl = (patch: Patch) => {
  // Handle the case where we don't need a URL prefix
  // This is specifically for patches within expansion, expansion changes usually merit a prefix
  if (!patch.urlPrefix) {
    return `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
  }
  return `${window.location.protocol}//${patch.urlPrefix}.${window.location.host}${window.location.pathname}`;
};

interface Props {
  children: React.ReactNode;
}

const PatchCheckerContents = ({
  reportPatch,
  reportExpansion,
}: {
  reportPatch: Patch | undefined;
  reportExpansion: Expansion;
}) => {
  const { report } = useReport();
  const dispatch = useWaDispatch();
  const reportDate = new Date(report.start).toLocaleDateString();

  const handleClickContinue = () => {
    dispatch(ignorePreviousPatchWarning(report.code));
  };
  usePageView('PatchChecker');
  const isThisExpansion = reportPatch?.expansion === reportExpansion;

  return (
    <div className="container offset">
      <h1>
        {report.title} - {reportDate}
      </h1>

      <Panel
        title={
          isThisExpansion ? (
            <>
              This report is for an earlier patch
            </>
          ) : (
            <>
              This report is for a previous expansion
            </>
          )
        }
        pad={false}
      >
        <div className="flex wrapable">
          <div className="flex-main pad">
            {isThisExpansion ? (
              <>
                WoWAnalyzer is constantly being updated to support the latest changes. This can
                cause some functionality to be modified for the latest talents/traits/trinkets or be
                removed.
                <br />
                <br />
                This could mean that some parts of your report will no longer be analysed
                accurately.
                <br />
                <br />
                If you would still like to view the analysis using the latest updates, you can click
                'Continue anyway' below.
              </>
            ) : (
              <>
                Due to the number of class changes since the last expansion (class abilities,
                talents, etc.), the analysis provided by WoWAnalyzer will most likely be inaccurate.
                <br />
                <br />
                You can still access the Analysis by clicking 'Continue anyway' below if required.
                <br />
                <br />
                If you would like to view the analysis on an older version of WoWAnalyzer,{' '}
                <a
                  href={reportPatch && makePreviousPatchUrl(reportPatch)}
                  onClick={handleClickContinue}
                  style={{ fontSize: '1.1em' }}
                >
                  <>click here</>
                </a>
                .
                <br />
                <br />
                If you would still like to view the analysis using the latest updates, you can click
                'Continue anyway' below.
              </>
            )}
            <br />
            <br />

            <div style={{ marginBottom: 15 }}>
              <GitHubButton /> <DiscordButton />
            </div>
            <Tooltip
              content={
                <>
                  Khadgar approves your bravery
                </>
              }
            >
              <Link
                to={window.location.pathname}
                onClick={handleClickContinue}
                style={{ fontSize: '1.1em' }}
              >
                <Icon icon="quest_khadgar" />{' '}
                <>Continue anyway</>
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
};

const PatchChecker = ({ children }: Props) => {
  const { report } = useReport();
  const ignored = useWaSelector((state) => state.reportCodesIgnoredPreviousPatchWarning);
  const isContinue = ignored.includes(report.code);

  const reportTimestamp = report.start;
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

  const skipPatchChecker = (reportPatch && reportPatch.isCurrent) || isContinue;

  if (skipPatchChecker) {
    return <>{children}</>;
  }

  return <PatchCheckerContents reportExpansion={reportExpansion} reportPatch={reportPatch} />;
};

export default PatchChecker;
