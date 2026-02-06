import styled from '@emotion/styled';
// force this to load if you render EmbeddedTimelineContainer
import './Timeline.scss';
import { TimelineSettingsContext } from './Component';
import { useRef, useState } from 'react';

/**
 * Container for embedding the timeline in another component.
 *
 * Use `SpellTimeline` component for wrapping the `Casts` component.
 */
const EmbeddedTimelineContainer = styled.div<{
  secondWidth?: number;
  secondsShown?: number;
  castBarCount?: number;
}>`
  .spell-timeline {
    position: relative;

    .casts {
      box-shadow: unset;
    }

    .cooldowns:only-child {
      margin-top: unset;
    }
  }

  --cast-bars: ${(props) => props.castBarCount ?? 1};

  padding: 1rem 2rem;
  overflow-x: clip;

  box-sizing: content-box;
  width: ${(props) => {
    const width = (props.secondWidth ?? 60) * (props.secondsShown ?? 10);
    return `${width}px`;
  }};
`;

export const SpellTimeline = ({
  ref,
  children,
}: React.PropsWithChildren<React.ComponentProps<'div'>> & {
  ref?: React.RefObject<HTMLDivElement | null>;
}) => (
  <div ref={ref} className="spell-timeline">
    {children}
  </div>
);

export default EmbeddedTimelineContainer;

type AutoSizerTimelineContainerProps = {
  secondsShown: number;
  castBarCount?: number;
  children?: React.ReactNode;
};

/**
 * Timeline container that automatically sets the width of seconds to prevent scrolling.
 *
 * If this is used inside a flexible container with no maximum size, it will continue
 * expanding forever. For that use case, use `EmbeddedTimelineContainer` instead and
 * set `secondWidth` manually.
 */
export const AutoSizerTimelineContainer = ({
  children,
  secondsShown,
  castBarCount,
}: AutoSizerTimelineContainerProps) => {
  // using this instead of AutoSizer because it works with the AnimateHeight component
  const [width, setWidth] = useState(0);
  const mutationObserver = useRef(
    new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rawWidth = entry.contentBoxSize[0].inlineSize;
        if (rawWidth > 0) {
          setWidth(Math.max(1, rawWidth));
        }
      }
    }),
  );
  const innerSecondWidth = width / secondsShown;

  return (
    <EmbeddedTimelineContainer
      secondsShown={secondsShown}
      castBarCount={castBarCount}
      secondWidth={0}
      style={{ width: '100%', boxSizing: 'border-box', maxWidth: '100%' }}
    >
      <div
        style={{ width: '100%' }}
        ref={(el) =>
          el ? mutationObserver.current.observe(el) : mutationObserver.current.disconnect()
        }
      >
        <TimelineSettingsContext value={{ secondWidth: innerSecondWidth }}>
          {children}
        </TimelineSettingsContext>
      </div>
    </EmbeddedTimelineContainer>
  );
};
