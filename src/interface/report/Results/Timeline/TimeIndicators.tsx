import { formatDuration } from 'common/format';
import { HTMLAttributes, use } from 'react';
import { TimelineSettingsContext } from './Settings';

interface Props extends HTMLAttributes<HTMLDivElement> {
  seconds: number;
  offset: number;
  secondWidth?: number;
  skipInterval: number;
  children?: React.ReactNode;
}

/**
 * A container displaying timestamp indicators in behind `children`. This is designed
 * to wrap the `Casts` component, and YMMV using it with other components.
 *
 * The container establishes a new relative point against which the time indicators are
 * positioned. This container contains the `children`.
 */
const TimeIndicators = ({
  seconds,
  offset,
  secondWidth: explicitSecondWidth,
  skipInterval,
  children,
  ...others
}: Props) => {
  const timelineSettings = use(TimelineSettingsContext);
  const secondWidth = explicitSecondWidth ?? timelineSettings.secondWidth;

  return (
    <div className="time-line-container">
      <div className="time-line" {...others}>
        {seconds > 0 &&
          Array.from({ length: Math.ceil(seconds / skipInterval) }).map((_, point) => (
            <div
              key={point + offset / 1000}
              style={{ width: secondWidth * skipInterval }}
              data-duration={formatDuration(point * skipInterval * 1000 + offset)}
            />
          ))}
      </div>
      {children}
    </div>
  );
};

export default TimeIndicators;
