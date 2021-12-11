import { formatDuration } from 'common/format';
import { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  seconds: number;
  offset: number;
  secondWidth: number;
  skipInterval: number;
}

const Timeline = ({ seconds, offset, secondWidth, skipInterval, ...others }: Props) => (
  <div className="time-line" {...others}>
    {seconds > 0 &&
      [...Array(Math.ceil(seconds))].map((_, second) => (
        <div
          key={second + offset / 1000}
          style={{ width: secondWidth * skipInterval }}
          data-duration={formatDuration(second * 1000 + offset)}
        />
      ))}
  </div>
);

export default Timeline;
