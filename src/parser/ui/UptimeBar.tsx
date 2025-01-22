import './UptimeBar.scss';
import { formatDuration } from 'common/format';
import { Tooltip } from 'interface';
import * as React from 'react';
import { TrackedBuffEvent } from 'parser/core/Entity';

export type Uptime = {
  /** Timestamp in milliseconds of the uptime start */
  start: number;
  /** Timestamp in milliseconds of the uptime end */
  end: number;
  /** Custom color to paint specifically this uptime. Will override barColor. */
  customColor?: string;
};

/** Helper function to convert a selection of entity buff history into Uptimes consumed by this component */
export function getUptimesFromBuffHistory(
  buffHistory: TrackedBuffEvent[],
  endTime: number,
  customColor?: string,
): Uptime[] {
  return buffHistory.map((tbe) => ({
    start: tbe.start,
    end: tbe.end !== null ? tbe.end : endTime,
    customColor,
  }));
}

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
}: Props & React.ComponentProps<'div'>) => {
  const fightDuration = fightEnd - fightStart;
  return (
    <div className="uptime-bar" {...others}>
      {uptimeHistory.map((buff) => {
        const start = buff.start;
        const end = buff.end !== null ? buff.end : fightEnd;
        const color = buff.customColor ? buff.customColor : barColor;
        return timeTooltip ? (
          <Tooltip
            key={`${color}-${start}-${end}`}
            content={formatDuration(start - fightStart) + `-` + formatDuration(end - fightStart)}
          >
            <div style={getSegmentStyle(start, end, fightStart, fightDuration, color)} />
          </Tooltip>
        ) : (
          <div
            key={`${color}-${start}-${end}`}
            style={getSegmentStyle(start, end, fightStart, fightDuration, color)}
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
  color: string | undefined,
): React.CSSProperties {
  return color !== undefined
    ? {
        left: `${((start - fightStart) / fightDuration) * 100}%`,
        width: `${((end - start) / fightDuration) * 100}%`,
        background: `${color}`,
      }
    : {
        left: `${((start - fightStart) / fightDuration) * 100}%`,
        width: `${((end - start) / fightDuration) * 100}%`,
      };
}

export default UptimeBar;
