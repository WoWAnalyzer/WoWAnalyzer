import { useCallback, useState } from 'react';
import type Spell from 'common/SPELLS/Spell';
import styled from '@emotion/styled';
import { Tooltip } from 'interface';
import { qualitativePerformanceToColor } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import GuideDataWrapper, { HelperText, HelperTextRow, NavButton } from './GuideDataWrapper';

export interface CastInSequence {
  timestamp: number;
  spellId: number;
  spellName: string;
  icon: string;
  performance?: QualitativePerformance;
  tooltip?: React.ReactNode;
}

interface SpellSequenceProps {
  casts: CastInSequence[];
  iconSize?: number;
}

/**
 * Standalone spell sequence filmstrip showing spell icons.
 * Can be used independently or as part of CastSequence.
 * @param casts - Array of cast data to display as icons
 * @param iconSize - Size in pixels for spell icons (default: 40)
 */
export function SpellSequence({ casts, iconSize = 40 }: SpellSequenceProps) {
  return (
    <Sequence>
      {casts.map((cast, castIdx) => {
        const color = cast.performance
          ? qualitativePerformanceToColor(cast.performance)
          : 'rgba(255, 255, 255, 0.3)';

        const defaultTooltip = (
          <div>
            <strong>{cast.spellName}</strong>
          </div>
        );

        return (
          <Tooltip key={castIdx} content={cast.tooltip || defaultTooltip}>
            <SpellIcon size={iconSize} color={color}>
              <img
                src={`https://wow.zamimg.com/images/wow/icons/large/${cast.icon}.jpg`}
                alt={cast.spellName}
              />
            </SpellIcon>
          </Tooltip>
        );
      })}
    </Sequence>
  );
}

export interface CastSequenceEntry<T = unknown> {
  data: T;
  casts: CastInSequence[];
  start?: number;
  end?: number;
}

interface CastSequenceProps<T = unknown> {
  spell: Spell;
  sequences: CastSequenceEntry<T>[];
  description?: string;
  castTimestamp: (data: T) => string;
  iconSize?: number;
}

/**
 * Navigable cast sequence visualization showing spell icons in a filmstrip layout.
 * @param spell - The spell/ability being analyzed
 * @param sequences - Array of cast sequence entries containing cast data
 * @param description - Optional description text displayed below the title
 * @param castTimestamp - Function to format timestamp from cast data
 * @param iconSize - Size in pixels for spell icons (default: 40)
 */
export default function CastSequence<T>({
  spell,
  sequences,
  description,
  castTimestamp,
  iconSize = 40,
}: CastSequenceProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : sequences.length - 1));
  }, [sequences.length]);
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < sequences.length - 1 ? prev + 1 : 0));
  }, [sequences.length]);

  if (!sequences || sequences.length === 0) {
    return <div>No cast sequences to display</div>;
  }

  const currentSequence = sequences[currentIndex];

  // Calculate window duration from start/end
  let windowStart = currentSequence.start;
  let windowEnd = currentSequence.end;

  if (windowStart === undefined || windowEnd === undefined) {
    // Fallback: calculate from casts
    if (currentSequence.casts.length > 0) {
      const timestamps = currentSequence.casts.map((c) => c.timestamp);
      windowStart = Math.min(...timestamps);
      windowEnd = Math.max(...timestamps);
    }
  }

  const subtitle = `Cast Sequence ${windowStart !== undefined ? `at ${castTimestamp(currentSequence.data)}` : ''}`;

  const navContent = (
    <NavigationButtons>
      <NavButton type="button" onClick={handlePrevious} aria-label="Previous sequence">
        ‹
      </NavButton>
      <NavCounter>
        {currentIndex + 1} / {sequences.length}
      </NavCounter>
      <NavButton type="button" onClick={handleNext} aria-label="Next sequence">
        ›
      </NavButton>
    </NavigationButtons>
  );

  const headerHelperText = description ? (
    <HelperTextRow>
      <HelperText>{description}</HelperText>
    </HelperTextRow>
  ) : undefined;

  return (
    <GuideDataWrapper
      title={`${spell.name} Cast Sequences`}
      subtitle={subtitle}
      stats={navContent}
      helperText={headerHelperText}
    >
      <ScrollableContainer>
        <SpellSequence casts={currentSequence.casts} iconSize={iconSize} />
      </ScrollableContainer>
    </GuideDataWrapper>
  );
}

const Sequence = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
`;

const SpellIcon = styled.div<{ size: number; color: string }>`
  position: relative;
  flex-shrink: 0;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border: 3px solid ${(props) => props.color};
  border-radius: 6px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 2px;
  align-items: center;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 999px;
  padding: 2px;
`;

const NavCounter = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  min-width: 36px;
  text-align: center;
`;

const ScrollableContainer = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px 6px 12px 6px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    height: 10px;
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
