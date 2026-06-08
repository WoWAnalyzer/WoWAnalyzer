import { useCallback, useState } from 'react';
import type Spell from 'common/SPELLS/Spell';
import cssComponent from 'interface/utils/css-component';
import styles from './CastSequence.module.scss';
import { Tooltip } from 'interface';
import { qualitativePerformanceToColor } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import GuideDataWrapper, { HelperText, HelperTextRow, SectionContainer } from './GuideDataWrapper';
import clsx from 'clsx';

export interface CastOverlay {
  spellId: number;
  spellName: string;
  icon: string;
}

export interface CastInSequence {
  timestamp: number;
  spellId: number;
  spellName: string;
  icon: string;
  performance?: QualitativePerformance;
  outlineColor?: string;
  ghosted?: boolean;
  tooltip?: React.ReactNode;
  /** Up to 2 small badges rendered in the top-right/bottom-right corners. */
  overlays?: CastOverlay[];
}

interface SpellSequenceProps {
  casts: CastInSequence[];
  iconSize?: number;
}

const DEFAULT_CAST_COLOR = 'rgba(255, 255, 255, 0.3)';
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
        const color =
          cast.outlineColor ??
          (cast.performance ? qualitativePerformanceToColor(cast.performance) : DEFAULT_CAST_COLOR);

        const defaultTooltip = (
          <div>
            <strong>{cast.spellName}</strong>
          </div>
        );

        const overlays = cast.overlays?.slice(0, 2) ?? [];

        return (
          <Tooltip key={castIdx} content={cast.tooltip || defaultTooltip}>
            <SpellIcon
              size={iconSize}
              color={color}
              className={clsx(
                color === DEFAULT_CAST_COLOR && styles.noOutline,
                cast.ghosted && styles.ghosted,
              )}
            >
              <img
                src={`https://wow.zamimg.com/images/wow/icons/large/${cast.icon}.jpg`}
                alt={cast.spellName}
              />
              {overlays.map((overlay, overlayIdx) => (
                <Overlay
                  key={overlay.spellId}
                  size={iconSize}
                  className={clsx(overlayIdx === 0 && styles.top)}
                >
                  <img
                    src={`https://wow.zamimg.com/images/wow/icons/large/${overlay.icon}.jpg`}
                    alt={overlay.spellName}
                  />
                </Overlay>
              ))}
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
      <CastSeqNavButton
        type="button"
        onClick={handlePrevious}
        disabled={currentIndex === 0}
        aria-label="Previous sequence"
      >
        ‹
      </CastSeqNavButton>
      <NavCounter>
        {currentIndex + 1} / {sequences.length}
      </NavCounter>
      <CastSeqNavButton
        type="button"
        onClick={handleNext}
        disabled={currentIndex === sequences.length - 1}
        aria-label="Next sequence"
      >
        ›
      </CastSeqNavButton>
    </NavigationButtons>
  );

  const inlineHelperText = description ? (
    <HelperTextRow>
      <HelperText>{description}</HelperText>
    </HelperTextRow>
  ) : undefined;

  return (
    <GuideDataWrapper title={`${spell.name} Cast Sequences`} subtitle={subtitle} stats={navContent}>
      {inlineHelperText}
      <SectionContainer>
        <SpellSequence casts={currentSequence.casts} iconSize={iconSize} />
      </SectionContainer>
    </GuideDataWrapper>
  );
}

const Sequence = cssComponent('div', styles.Sequence, [] as const);

const SpellIcon = cssComponent('div', styles.SpellIcon, ['color', 'size', 'ghosted'] as const);

const NavigationButtons = cssComponent('div', styles.NavigationButtons, [] as const);

/** Compact prev/next button used in the CastSequence nav pill */
const CastSeqNavButton = cssComponent('button', styles.CastSeqNavButton, [] as const);

const NavCounter = cssComponent('div', styles.NavCounter, [] as const);

const Overlay = cssComponent('div', styles.Overlay, ['size'] as const);
