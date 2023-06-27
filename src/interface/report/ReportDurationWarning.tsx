import AlertWarning from 'interface/AlertWarning';

import { formatNumber } from '../../common/format';

interface Props {
  duration: number;
}

const DAYS_IN_MS = 86400000;
export const MAX_REPORT_DURATION = DAYS_IN_MS * 7;

const ReportDurationWarning = ({ duration }: Props) => {
  const durationInDays = () => duration / DAYS_IN_MS;

  return (
    <div className="container">
      <AlertWarning style={{ marginBottom: 30 }}>
        <h2>
          <>Report exceeds supported duration</>
        </h2>
        <>
          The current report contains data collected over{' '}
          <strong>
            {formatNumber(durationInDays())} {durationInDays() > 1 ? `days` : `day`}
          </strong>
          . This could lead to parsing issues with fights later in the report. We recommend that you
          split your logs before uploading them to warcraftlogs.com.
        </>
      </AlertWarning>
    </div>
  );
};

export default ReportDurationWarning;
