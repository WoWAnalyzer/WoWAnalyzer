import React from 'react';
import './UptimeBar.scss';
import { formatDuration } from 'common/format';
import { Tooltip } from 'interface';

export type Uptime = {
  start: number;
  end: number;
};

type Props = {
  uptimeHistory: Uptime[];
  start: number;
  end: number;
  barColor?: string;
  timeTooltip?: boolean;
};

const UptimeBar = ({ uptimeHistory, start: fightStart, end: fightEnd, barColor, timeTooltip, ...others }: Props) => {
  const fightDuration = fightEnd - fightStart;

  return (
    <div className="uptime-bar" {...others}>
      {uptimeHistory.map((buff) => {
        const start = buff.start;
        const end = buff.end !== null ? buff.end : fightEnd;
        return timeTooltip
          ? (
          <Tooltip key={`${start}-${end}`}
            content={formatDuration((start - fightStart)/1000) + `-` + formatDuration((end - fightStart)/1000)}
          >
            <div

              style={{
                left: `${((start - fightStart) / fightDuration) * 100}%`,
                width: `${((end - start) / fightDuration) * 100}%`,
                background: `${barColor}`
              }}
            />
          </Tooltip>
        )
        : (
            <div
              key={`${start}-${end}`}
              style={{
                left: `${((start - fightStart) / fightDuration) * 100}%`,
                width: `${((end - start) / fightDuration) * 100}%`,
                background: `${barColor}`
              }}
            />
          );
      })}
    </div>
  );
};

export default UptimeBar;
