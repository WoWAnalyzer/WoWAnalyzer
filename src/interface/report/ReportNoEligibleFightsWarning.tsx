import { Trans } from '@lingui/react/macro';
import AlertWarning from 'interface/AlertWarning';

const ReportNoEligibleFightsWarning = () => {
  return (
    <div className="container">
      <AlertWarning>
        <h2>
          <Trans id="interface.report.noEligibleFights.warning">
            Report contains no eligible fights
          </Trans>
        </h2>
        <Trans id="interface.report.noEligibleFights.warningDetails">
          The current report only contains fights that are not eligible for WoWAnalyzer analysis.
          WoWAnalyzer relies on certain events being logged by the game - fights like target dummies
          do not log these events.
        </Trans>
      </AlertWarning>
    </div>
  );
};

export default ReportNoEligibleFightsWarning;
