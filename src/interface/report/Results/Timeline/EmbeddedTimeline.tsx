import styled from '@emotion/styled';
import React from 'react';
// force this to load if you render EmbeddedTimelineContainer
import './Timeline.scss';

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

  --cast-bars: ${(props) => props.castBarCount ?? 0};

  padding: 1rem 2rem;
  border-radius: 0.5rem;
  background: #222;

  box-sizing: content-box;
  width: ${(props) => {
    const width = (props.secondWidth ?? 60) * (props.secondsShown ?? 10);
    return `${width}px`;
  }};
`;

export const SpellTimeline = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<React.ComponentProps<'div'>>
>(({ children }, ref) => (
  <div ref={ref} className="spell-timeline">
    {children}
  </div>
));

export default EmbeddedTimelineContainer;
