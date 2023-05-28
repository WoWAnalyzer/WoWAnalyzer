import './UptimeBar.scss';
import { formatDuration } from 'common/format';
import { Tooltip } from 'interface';
import * as React from 'react';

export type Uptime = {
  /** Timestamp in milliseconds of the uptime start */
  start: number;
  /** Timestamp in milliseconds of the uptime end */
  end: number;
};

type Props = {
  uptimeHistory: Uptime[];
  start: number;
  end: number;
  barColor?: string;
  timeTooltip?: boolean;
};

const UptimeBar = ({
  uptimeHistory,
  start: fightStart,
  end: fightEnd,
  barColor,
  timeTooltip,
  ...others
}: Props) => {
  const fightDuration = fightEnd - fightStart;
  return (
    <div className="uptime-bar" {...others}>
      {uptimeHistory.map((buff) => {
        const start = buff.start;
        const end = buff.end !== null ? buff.end : fightEnd;
        return timeTooltip ? (
          <Tooltip
            key={`${start}-${end}`}
            content={formatDuration(start - fightStart) + `-` + formatDuration(end - fightStart)}
          >
            <div style={getSegmentStyle(start, end, fightStart, fightDuration, barColor)} />
          </Tooltip>
        ) : (
          <div
            key={`${start}-${end}`}
            style={getSegmentStyle(start, end, fightStart, fightDuration, barColor)}
          />
        );
      })}
    </div>
  );
};

function getSegmentStyle(
  start: number,
  end: number,
  fightStart: number,
  fightDuration: number,
  barColor: string | undefined,
): React.CSSProperties {
  return barColor !== undefined
    ? {
        left: `${((start - fightStart) / fightDuration) * 100}%`,
        width: `${((end - start) / fightDuration) * 100}%`,
        background: `${barColor}`,
      }
    : {
        left: `${((start - fightStart) / fightDuration) * 100}%`,
        width: `${((end - start) / fightDuration) * 100}%`,
      };
}

export default UptimeBar;
