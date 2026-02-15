import { useState } from 'react';
import type Spell from 'common/SPELLS/Spell';
import { AnyEvent } from 'parser/core/Events';
import {
  EmbeddedTimelineContainer,
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import Casts from 'interface/report/Results/Timeline/Casts';
import styled from '@emotion/styled';

export interface CastTimelineEntry<T = unknown> {
  data: T;
  casts: AnyEvent[];
  start?: number;
  end?: number;
}

interface CastTimelineProps<T = unknown> {
  spell: Spell;
  events: CastTimelineEntry<T>[];
  windowDescription?: string;
  castTimestamp: (data: T) => string;
  secondWidth?: number;
}

/**
 * Navigable cast timeline visualization with previous/next navigation.
 * @param spell - The spell being analyzed
 * @param events - Array of timeline entries containing cast data and events
 * @param windowDescription - Optional description of the time window (e.g., "3s window")
 * @param castTimestamp - Function to format timestamp from cast data
 * @param secondWidth - Width in pixels per second for timeline scaling (default: 50)
 */
export default function CastTimeline<T>({
  spell,
  events,
  windowDescription,
  castTimestamp,
  secondWidth = 50,
}: CastTimelineProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!events || events.length === 0) {
    return <div>No casts to display</div>;
  }

  const currentEvent = events[currentIndex];
  const timestamp = castTimestamp(currentEvent.data);

  // Calculate window duration from start/end, or fall back to earliest/latest event
  let windowStart = currentEvent.start;
  let windowEnd = currentEvent.end;

  if (windowStart === undefined || windowEnd === undefined) {
    // Fallback: calculate from events
    const timestamps = currentEvent.casts.map((e) => e.timestamp);
    windowStart = Math.min(...timestamps);
    windowEnd = Math.max(...timestamps);
  }

  const duration = (windowEnd - windowStart) / 1000; // Convert to seconds

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : events.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < events.length - 1 ? prev + 1 : 0));
  };

  const timestampText = ` @ ${timestamp}`;

  return (
    <Container>
      <HeaderSection>
        <HeaderTitle>Per-Cast Timeline</HeaderTitle>
        {windowDescription && <WindowDescription>{windowDescription}</WindowDescription>}
      </HeaderSection>

      <ControlsSection>
        <CastInfo>
          <CastTitle>
            {spell.name} #{currentIndex + 1}
            {timestampText}
          </CastTitle>
          <CastCount>
            {currentIndex + 1} of {events.length}
          </CastCount>
        </CastInfo>

        <NavigationButtons>
          <NavButton type="button" onClick={handlePrevious} aria-label="Previous cast">
            ← Prev
          </NavButton>

          <NavButton type="button" onClick={handleNext} aria-label="Next cast">
            Next →
          </NavButton>
        </NavigationButtons>
      </ControlsSection>

      <TimelineScrollContainer>
        <EmbeddedTimelineContainer secondWidth={secondWidth} secondsShown={duration}>
          <SpellTimeline>
            <Casts start={windowStart} secondWidth={secondWidth} events={currentEvent.casts} />
          </SpellTimeline>
        </EmbeddedTimelineContainer>
      </TimelineScrollContainer>
    </Container>
  );
}

const Container = styled.div`
  margin-bottom: 16px;
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fab700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const WindowDescription = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
`;

const ControlsSection = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 10px;
`;

const CastInfo = styled.div`
  flex: 1;
`;

const CastTitle = styled.div`
  font-weight: 600;
  font-size: 13px;
  color: #fff;
  margin-bottom: 4px;
`;

const CastCount = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

const NavButton = styled.button`
  padding: 6px 14px;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background: rgba(250, 183, 0, 0.15);
    border-color: #fab700;
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TimelineScrollContainer = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 8px;

  &::-webkit-scrollbar {
    height: 12px;
    cursor: default !important;
  }

  &::-webkit-scrollbar-track {
    background: rgba(104, 103, 100, 0.15);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: #fab700;
  }
`;
