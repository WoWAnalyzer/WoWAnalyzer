import type { JSX } from 'react';
import Spell from 'common/SPELLS/Spell';

export interface ExpandableConfig {
  spell: Spell;
  formatTimestamp: (timestamp: number) => string;
  getTimestamp: (data: unknown) => number;
  checklistItems: ExpandableChecklistItem[];
}

export interface ExpandableChecklistItem {
  label: JSX.Element;
  getResult: (data: unknown, evaluatedData: BoxRowEntry) => boolean;
  getDetails: (data: unknown) => string;
}

/**
 * Creates an expandable breakdown configuration.
 * @param config - Configuration object with spell, timestamp functions, and checklist items
 */
export function createExpandableConfig(config: {
  spell: Spell;
  formatTimestamp: (timestamp: number) => string;
  getTimestamp: (cast: unknown) => number;
  checklistItems: Array<{
    label: JSX.Element;
    getResult: (cast: unknown, evaluatedData: BoxRowEntry) => boolean;
    getDetails: (cast: unknown) => string;
  }>;
}): ExpandableConfig {
  return {
    spell: config.spell,
    formatTimestamp: config.formatTimestamp,
    getTimestamp: config.getTimestamp,
    checklistItems: config.checklistItems.map((item) => ({
      label: item.label,
      getResult: item.getResult,
      getDetails: item.getDetails,
    })),
  };
}
import type { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import CooldownExpandable from 'interface/guide/components/CooldownExpandable';
import { PassFailCheckmark } from 'interface/guide';
import { SpellLink } from 'interface';

interface ExpandableBreakdownProps {
  castData: unknown[];
  evaluatedData: BoxRowEntry[];
  expandableConfig: ExpandableConfig;
}

/**
 * Displays expandable per-cast breakdown with checklist items.
 * @param castData - Array of raw cast data
 * @param evaluatedData - Array of evaluated performance data
 * @param expandableConfig - Configuration for the breakdown display
 */
export default function ExpandableBreakdown({
  castData,
  evaluatedData,
  expandableConfig,
}: ExpandableBreakdownProps) {
  return (
    <>
      {castData.map((cast, index) => {
        const evaluatedEntry = evaluatedData[index];
        const timestamp = expandableConfig.getTimestamp(cast);
        const checklistItems = expandableConfig.checklistItems.map((item) => ({
          label: item.label,
          result: <PassFailCheckmark pass={item.getResult(cast, evaluatedEntry)} />,
          details: item.getDetails(cast),
        }));

        const header = (
          <>
            @ {expandableConfig.formatTimestamp(timestamp)} &mdash;{' '}
            <SpellLink spell={expandableConfig.spell} />
          </>
        );

        return (
          <CooldownExpandable
            header={header}
            checklistItems={checklistItems}
            perf={evaluatedEntry.value}
            key={index}
          />
        );
      })}
    </>
  );
}
