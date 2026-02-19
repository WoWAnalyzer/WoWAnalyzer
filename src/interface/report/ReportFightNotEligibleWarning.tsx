import { Trans } from '@lingui/react/macro';
import AlertWarning from 'interface/AlertWarning';

const ReportFightNotEligibleWarning = () => {
  return (
    <div className="container">
      <AlertWarning>
        <h2>
          <Trans id="interface.report.fightNotEligible.warning">
            This fight is ineligible for analysis
          </Trans>
        </h2>
        <Trans id="interface.report.fightNotEligible.warningDetails">
          The selected fight is not eligible for WoWAnalyzer analysis. WoWAnalyzer relies on certain
          events being logged by the game - fights like target dummies do not log these events.
        </Trans>
      </AlertWarning>
    </div>
  );
};

export default ReportFightNotEligibleWarning;
