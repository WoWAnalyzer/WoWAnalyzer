import { Trans } from '@lingui/macro';
import AlertWarning from 'interface/AlertWarning';

const LogChangesIn102Warning = () => {
  return (
    <div className="container">
      <AlertWarning style={{ marginBottom: 30 }}>
        <h2>
          <Trans id="interface.report.logChangesIn102.warning">
            Report might have inaccuracies
          </Trans>
        </h2>
        <Trans id="interface.report.logChangesIn102.warningDetails">
          The current report contains data collected during the launch of 10.2. This could lead to
          parsing issues with fights in the report due to logging changes that Blizzard has made. We
          recommend taking results with a grain of salt until log parsing has stabilized.
        </Trans>
      </AlertWarning>
    </div>
  );
};

export default LogChangesIn102Warning;
