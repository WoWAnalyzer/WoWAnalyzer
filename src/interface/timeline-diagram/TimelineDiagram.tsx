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

interface Segment {
  start: number;
  end: number;
}

export default function TimelineDiagram({ info, children, overlays }: Props): JSX.Element | null {
  const [elementWidth, setWidth] = useState(0);
  const [zoom, setZoom] = useState<Segment | undefined>(undefined);
  const zoomEvent = useRef<React.SyntheticEvent | null>(null);

  const el = useRef<SVGSVGElement | null>(null);

  const pxPerMs = useMemo(() => {
    const ms = zoom ? zoom.end - zoom.start : info.fightDuration;
    return elementWidth / ms;
  }, [zoom, info, elementWidth]);

  useEffect(() => {
    // reset zoom when `info` changes
    setZoom(undefined);
  }, [info]);

  const observer = useRef(
    new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = entry.target.getBoundingClientRect();
        setWidth(rect.width);
      }
    }),
  );

  const watchWidth = useCallback((element: SVGSVGElement | null) => {
    if (element) {
      el.current = element;
      observer.current.observe(element);
    } else {
      el.current = null;
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

  const contextValue = useMemo(
    (): TimelineContext => ({
      x,
      width,
      zoom(event, start, end) {
        zoomEvent.current = event;
        setZoom({ start: Math.max(info.fightStart, start), end: Math.min(info.fightEnd, end) });
      },
      resetZoom(event) {
        zoomEvent.current = event;
        setZoom(undefined);
      },
    }),
    [x, width, info],
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

  const zoomAny = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (event === zoomEvent.current) {
        return; // someone else already adjusted zoom for this
      }
      setZoom((zoom) => {
        if (zoom) {
          return zoom;
        }
        if (event.currentTarget || el.current) {
          // x = (time - start) / duration * width
          // x / width * duration + start = time
          const rect = (event.currentTarget ?? el.current).getBoundingClientRect();
          const clickPx = event.clientX - rect.left;
          const clickTime = (clickPx / rect.width) * info.fightDuration + info.fightStart;
          return {
            start: Math.max(clickTime - 30000, info.fightStart),
            end: Math.min(clickTime + 30000, info.fightEnd),
          };
        }
      });
    },
    [info],
  );

  const isMouseDown = useRef(false);
  const mouseStart = useRef<{ x: number } | undefined>();
  const beginScroll = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    isMouseDown.current = true;
    mouseStart.current = {
      x: event.screenX,
    };
  }, []);

  const zoomOrEndScroll = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      isMouseDown.current = false;
      zoomAny(event);
    },
    [zoomAny],
  );

  const doScroll = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!isMouseDown.current) {
        return;
      }
      const { x } = mouseStart.current!;
      const deltaX = event.screenX - x;
      mouseStart.current = { x: event.screenX };

      setZoom((zoom) => {
        if (!zoom) {
          return undefined;
        }

        const rect = (event.currentTarget ?? el.current).getBoundingClientRect();
        const duration = zoom.end - zoom.start;
        const deltaMs = (deltaX / rect.width) * duration;

        const result = {
          start: zoom.start - deltaMs,
          end: zoom.end - deltaMs,
        };

        if (result.start < info.fightStart) {
          return {
            start: info.fightStart,
            end: info.fightStart + duration,
          };
        } else if (result.end > info.fightEnd) {
          return {
            start: info.fightEnd - duration,
            end: info.fightEnd,
          };
        } else {
          return result;
        }
      });
    },
    [info],
  );

  const doWheelScroll = useCallback(
    (event: React.WheelEvent<SVGSVGElement>) => {
      setZoom((zoom) => {
        if (!zoom) {
          return undefined;
        }

        const rect = (event.currentTarget ?? el.current).getBoundingClientRect();
        const duration = zoom.end - zoom.start;
        const deltaMs = (event.deltaX / rect.width) * duration;

        const result = {
          start: zoom.start - deltaMs,
          end: zoom.end - deltaMs,
        };

        if (result.start < info.fightStart) {
          return {
            start: info.fightStart,
            end: info.fightStart + duration,
          };
        } else if (result.end > info.fightEnd) {
          return {
            start: info.fightEnd - duration,
            end: info.fightEnd,
          };
        } else {
          return result;
        }
      });
    },
    [info],
  );

  const clearScrollState = useCallback((event: React.MouseEvent<unknown>) => {
    if (event.buttons === 0) {
      // no buttons are pushed, clear scroll state
      isMouseDown.current = false;
      mouseStart.current = undefined;
    }
  }, []);

  const phases = usePhaseSegments();

  return (
    <ctx.Provider value={contextValue}>
      <div>
        <svg
          ref={watchWidth}
          height={trackHeight + (phases.length ? PhaseHeader.HEIGHT : 0)}
          width="100%"
          preserveAspectRatio="none"
          onMouseDown={beginScroll}
          onMouseUp={zoomOrEndScroll}
          onMouseMove={doScroll}
          onMouseEnter={clearScrollState}
          onDoubleClick={() => setZoom(undefined)}
          onWheel={doWheelScroll}
        >
          <svg
            x={zoom ? -pxPerMs * (zoom?.start - info.fightStart) : 0}
            y={0}
            width={pxPerMs * info.fightDuration}
            height="100%"
          >
            {phases.length && <PhaseHeader />}
            <svg x={0} y={phases.length ? PhaseHeader.HEIGHT : 0} width="100%" height="100%">
              {renderedTracks}
              {overlays}
            </svg>
          </svg>
        </svg>
        <ZoomText isZoomed={Boolean(zoom)} />
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
  margin-top: -0.3em;
`;
