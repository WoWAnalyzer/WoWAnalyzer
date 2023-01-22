import './UptimeBar.scss';
import { formatDuration } from 'common/format';
import { Tooltip } from 'interface';
import { Uptime } from 'parser/ui/UptimeBar';
import * as React from 'react';

export type StackUptime = {
  /** Timestamp in milliseconds of the uptime start */
  start: number;
  /** Timestamp in milliseconds of the uptime end */
  end: number;
  /** The number of stacks active during this time */
  stacks: number;
};

type Props = {
  /** Uptimes to render, including number of active stacks */
  stackUptimeHistory: StackUptime[];
  /** Starting timestamp */
  start: number;
  /** Ending timestamp */
  end: number;
  /** Maximum stacks to render - will show as full bar */
  maxStacks: number;
  /** Uptime bar color in format '#rrggbb' */
  barColor?: string;
  /** Optional additional set of uptimes which will background the stack uptimes */
  backgroundHistory?: Uptime[];
  /** Background uptime bar color in format '#rrggbb'. If a background bar is specified, this must be defined */
  backgroundBarColor?: string;
  /** If true, the background bars will have tooltips indicating their time range */
  timeTooltip?: boolean;
};

const UptimeStackBar = ({
  stackUptimeHistory,
  start: fightStart,
  end: fightEnd,
  maxStacks,
  barColor,
  backgroundHistory,
  backgroundBarColor,
  timeTooltip,
  ...others
}: Props) => {
  const fightDuration = fightEnd - fightStart;
  return (
    <div className="uptime-bar" {...others}>
      {backgroundHistory &&
        backgroundHistory.map((buff) => {
          const start = buff.start;
          const end = buff.end !== null ? buff.end : fightEnd;
          return timeTooltip ? (
            <Tooltip
              key={`${start}-${end}`}
              content={formatDuration(start - fightStart) + `-` + formatDuration(end - fightStart)}
            >
              <div
                style={getSegmentStyle(
                  start,
                  end,
                  1,
                  1,
                  fightStart,
                  fightDuration,
                  backgroundBarColor,
                )}
              />
            </Tooltip>
          ) : (
            <div
              key={`${start}-${end}`}
              style={getSegmentStyle(
                start,
                end,
                1,
                1,
                fightStart,
                fightDuration,
                backgroundBarColor,
              )}
            />
          );
        })}
      {stackUptimeHistory.map((buff) => {
        const start = buff.start;
        const end = buff.end !== null ? buff.end : fightEnd;
        return (
          <div
            key={`${start}-${end}`}
            style={getSegmentStyle(
              start,
              end,
              buff.stacks,
              maxStacks,
              fightStart,
              fightDuration,
              barColor,
              true,
            )}
          />
        );
      })}
    </div>
  );
};

function getSegmentStyle(
  start: number,
  end: number,
  stacks: number,
  maxStacks: number,
  fightStart: number,
  fightDuration: number,
  barColor: string | undefined,
  clickThrough?: boolean,
): React.CSSProperties {
  const percentStacks = Math.min(stacks / maxStacks, 1);

  const cssProps: React.CSSProperties = {
    top: `${100 - 100 * percentStacks}%`,
    height: `${100 * percentStacks}%`,
    left: `${((start - fightStart) / fightDuration) * 100}%`,
    width: `${((end - start) / fightDuration) * 100}%`,
  };
  if (barColor !== undefined) {
    cssProps.background = `${barColor}`;
  }
  if (clickThrough) {
    cssProps.pointerEvents = 'none';
  }
  return cssProps;
}

export default UptimeStackBar;
