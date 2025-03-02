import styled from '@emotion/styled';
import { useEvents } from 'interface/guide';
import { EventType } from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

interface TimelineContext {
  /**
   * Compute the x coordinate value of a timestamp.
   */
  x(timestamp: number): number;
  width(start: number, end: number): number;
  /**
   * Zoom to the timestamp range. Only impacts the horizontal axis.
   */
  zoom(event: React.SyntheticEvent, start: number, end: number): void;
  /**
   * Reset the timeline zoom.
   */
  resetZoom(event: React.SyntheticEvent): void;
}

const ctx = React.createContext<TimelineContext>({
  x() {
    return 0;
  },
  width() {
    return 0;
  },
  zoom(start, end) {},
  resetZoom() {},
});

export const useTimelinePosition = () => useContext(ctx);

/**
 * A track within the timeline diagram. For example: all the spells a player casts occupy a single track.
 *
 * Each track will be rendered within an SVG container that sets bounds to the correct positions.
 *
 * ## Rationale
 * SVG doesn't have flexbox and pulling in a flexbox-in-JS library is massive overkill for what we need. Explicitly specifying desired height allows a simple automatic layout with minimal extra work.
 */
export interface TimelineTrack {
  /**
   * Same as CSS z-index. Default is 0.
   */
  zIndex?: number;
  /**
   * The height (in logical px) of the track. Keep in mind that the entire diagram may be re-scaled, so relying on this matching pixels outside the diagram is not safe.
   */
  height: number;
  /**
   * Render the track. This is rendered inside an `<svg />` that has the correct position and size set.
   */
  element: JSX.Element | null;
  /**
   * Whether to entirely hide the track. This causes the height to not be consumed at all.
   */
  hidden?: (x: (timestamp: number) => number) => boolean;
}

interface Props {
  info: Info;
  children: TimelineTrack | TimelineTrack[];
  overlays: React.ReactNode[];
}

export default function TimelineDiagram({ info, children, overlays }: Props): JSX.Element | null {
  // track the width of the container element to use for display calculations.
  // setting this does NOT resize the container
  const [containerElementWidth, recordContainerElementWidth] = useState(0);
  // set the number of milliseconds that should be displayed at once. if undefined, the whole fight is shown.
  // the use of undefined to mean "the whole fight" is simply to make the zoom control logic simpler (since `undefined` = no zoom)
  const [displayMs, setDisplayMs] = useState<number | undefined>(undefined);
  // ref to track the current zoom event. this is used to paper over some issues that seem like react bugs with `event.currentTarget` / `event.target`?
  const zoomEvent = useRef<React.SyntheticEvent | null>(null);

  const containerElement = useRef<HTMLDivElement | null>(null);

  const pxPerMs = containerElementWidth / (displayMs ?? info.fightDuration);

  useEffect(() => {
    // reset zoom when `info` changes
    setDisplayMs(undefined);
  }, [info]);

  const observer = useRef(
    new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = entry.target.getBoundingClientRect();
        recordContainerElementWidth(rect.width);
      }
    }),
  );

  const watchWidth = useCallback((element: HTMLDivElement | null) => {
    if (element) {
      containerElement.current = element;
      observer.current.observe(element);
    } else {
      containerElement.current = null;
      observer.current.disconnect();
    }
  }, []);

  const x = useCallback(
    (time: number) => {
      return (time - info.fightStart) * pxPerMs;
    },
    [info, pxPerMs],
  );
  const width = useCallback((start: number, end: number) => x(end) - x(start), [x]);

  const setScrollLeft = useCallback(
    (timestamp: number) => {
      containerElement.current?.scroll(x(timestamp), 0);
    },
    [x],
  );

  const contextValue = useMemo(
    (): TimelineContext => ({
      x,
      width,
      zoom(event, start, end) {
        zoomEvent.current = event;
        setDisplayMs(Math.min(info.fightDuration, end - start));
        setScrollLeft(start);
      },
      resetZoom(event) {
        zoomEvent.current = event;
        setDisplayMs(undefined);
      },
    }),
    [x, width, info, setScrollLeft],
  );

  const [renderedTracks, trackHeight] = useMemo(() => {
    const tracks = Array.isArray(children) ? children : [children];
    let totalHeight = 0;
    const unLayeredOutput = tracks
      .map(({ height, element: render, hidden, zIndex }, i) => {
        if (!hidden?.(x)) {
          const result = (
            <svg
              x={0}
              y={totalHeight}
              width="100%"
              height={height}
              key={i}
              style={{ overflowY: 'visible' }}
            >
              {render}
            </svg>
          );
          totalHeight += height;
          return [zIndex ?? 0, result];
        }
        return null;
      })
      .filter((v): v is [number, JSX.Element] => v !== null);

    unLayeredOutput.sort(([zA], [zB]) => zA - zB);
    const output = unLayeredOutput.map(([_, el]) => el);

    output.push(<Timestamps key="timestamps" topOffset={totalHeight} info={info} />);

    return [output, totalHeight + Timestamps.HEIGHT];
  }, [children, info, x]);

  const zoomOnClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (event === zoomEvent.current) {
        return; // someone else already adjusted zoom for this
      }
      setDisplayMs((displayMs) => {
        if (displayMs) {
          return displayMs;
        }
        if (event.currentTarget || containerElement.current) {
          // first, calculate the desired timescale
          const rect = (event.currentTarget ?? containerElement.current).getBoundingClientRect();
          const targetDuration = rect.width / ZOOM_DISPLAY_PX_PER_MS;
          if (targetDuration > info.fightDuration) {
            return undefined; // don't zoom if we are viewing a smaller segment already. this can happen with short intermissions
          }
          // then, calculate the click position on the original timescale
          const clickPx = event.clientX - rect.left;
          const clickPct = clickPx / rect.width;
          const clickTimestamp = clickPct * info.fightDuration;
          // then, adjust the position to be of the left edge of the display instead of the center
          const scrollTimestamp = Math.max(0, clickTimestamp - targetDuration / 2);
          const scrollPct = scrollTimestamp / info.fightDuration;
          // finally, apply the scroll position and timescale. setTimeout(..., 0) is used to adjust the scroll position *after* the next render (we hope)
          setTimeout(() => {
            containerElement.current?.scroll(
              scrollPct * (containerElement?.current.scrollWidth ?? 0),
              0,
            );
          }, 0);
          // we don't use the `x` helper to prevent rerender cascades
          return targetDuration;
        }
      });
    },
    [info],
  );

  // enable mouse panning for desktop users. laptop users can do horizontal scrolling relatively easily.
  // on desktop, this requires knowing shift+mousewheel does it, and is not as nice
  const panStartPosition = useRef<{ cursor: number; scroll: number } | undefined>(undefined);
  const startPanning = useCallback((event: React.MouseEvent<unknown>) => {
    const container = containerElement.current;
    if (container) {
      panStartPosition.current = {
        cursor: event.clientX,
        scroll: container.scrollLeft,
      };
    }
  }, []);
  const stopPanning = useCallback((event: React.MouseEvent<unknown>) => {
    panStartPosition.current = undefined;
  }, []);

  const mouseMovePan = useCallback(
    (event: React.MouseEvent<unknown>) => {
      const startPos = panStartPosition.current;
      const container = containerElement.current;
      if (!displayMs || !startPos || event.buttons === 0 || !container) {
        return;
      }

      container.scrollLeft = startPos.scroll - (event.clientX - startPos.cursor);
    },
    [displayMs],
  );

  const phases = usePhaseSegments();

  return (
    <ctx.Provider value={contextValue}>
      <div>
        <div
          ref={watchWidth}
          style={{
            overflowX: 'scroll',
            overflowY: 'clip',
            width: '100%',
            height: 'max-content',
          }}
        >
          <svg
            height={trackHeight + (phases.length ? PhaseHeader.HEIGHT : 0)}
            width={pxPerMs * info.fightDuration}
            preserveAspectRatio="none"
            onDoubleClick={() => setDisplayMs(undefined)}
            onClick={zoomOnClick}
            onMouseDown={startPanning}
            onMouseUp={stopPanning}
            onMouseMove={mouseMovePan}
          >
            <svg x={0} y={0} width="100%" height="100%">
              {phases.length && <PhaseHeader />}
              <svg x={0} y={phases.length ? PhaseHeader.HEIGHT : 0} width="100%" height="100%">
                {renderedTracks}
                {overlays}
              </svg>
            </svg>
          </svg>
        </div>
        <ZoomText isZoomed={Boolean(displayMs)} />
      </div>
    </ctx.Provider>
  );
}

function usePhaseSegments() {
  const events = useEvents();

  return useMemo(() => {
    const segments = [];
    let start = undefined;
    for (const event of events) {
      if (event.type === EventType.PhaseStart) {
        start = event;
      } else if (start && event.type === EventType.PhaseEnd) {
        segments.push({
          start: start.timestamp,
          end: event.timestamp,
          name: start.phase.name,
        });
      }
    }

    return segments;
  }, [events]);
}

function PhaseHeader(): JSX.Element {
  const phaseSegments = usePhaseSegments();
  const { x, width, zoom } = useTimelinePosition();

  return (
    <svg x="0" y="0" width="100%" height="100%">
      {phaseSegments.map((segment, i) => (
        <g key={i}>
          <rect
            onClick={(e) => {
              zoom(e, segment.start, segment.end);
            }}
            x={x(segment.start)}
            width={width(segment.start, segment.end)}
            height={24}
            fill="#201d15"
            stroke="black"
            style={{
              cursor: 'pointer',
            }}
          />
          <text
            textAnchor="middle"
            x={x(segment.start) + width(segment.start, segment.end) / 2}
            y={16}
            fill="#f3eded"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {segment.name.split(':')[0]}
          </text>
        </g>
      ))}
    </svg>
  );
}

PhaseHeader.HEIGHT = 30;

function Timestamps({ topOffset, info }: { topOffset: number; info: Info }): JSX.Element {
  const { x } = useTimelinePosition();

  const numTimestamps = Math.floor(info.fightDuration / 60000) + 1;

  return (
    <svg x={0} y={topOffset} width="100%" height="100%">
      {Array.from({ length: numTimestamps }).map((_, minuteIndex) => {
        if (minuteIndex === 0) {
          return null;
        } else {
          const timestamp = minuteIndex * 60000 + info.fightStart;
          return (
            <g key={minuteIndex}>
              <line x1={x(timestamp)} x2={x(timestamp)} y1={0} y2={6} stroke="#999" />
              <text
                x={x(timestamp)}
                y={16}
                fill="#ccc"
                fontSize={10}
                textAnchor="middle"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {minuteIndex}m
              </text>
            </g>
          );
        }
      })}
    </svg>
  );
}
Timestamps.HEIGHT = 20;

function ZoomText({ isZoomed }: { isZoomed: boolean }): JSX.Element {
  const { resetZoom } = useTimelinePosition();
  if (isZoomed) {
    return (
      <ZoomTextContainer>
        <ResetZoomButton onClick={(e) => resetZoom(e)}>
          <small>Reset Zoom</small>
        </ResetZoomButton>
      </ZoomTextContainer>
    );
  } else {
    return (
      <ZoomTextContainer>
        <small>Click the timeline to zoom</small>
      </ZoomTextContainer>
    );
  }
}

const ResetZoomButton = styled.button`
  appearance: none;
  background: none;
  border: none;

  & small {
    text-decoration: underline;
  }
`;

const ZoomTextContainer = styled.div`
  line-height: 1;
  margin-bottom: 0.5em;
`;

const ZOOM_DISPLAY_PX_PER_MS = 16 / 1000;
