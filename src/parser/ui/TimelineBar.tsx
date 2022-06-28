import './TimelineBar.scss';
import Spell from 'common/SPELLS/Spell';
import { SpellIcon, Tooltip } from 'interface';
import Cross from 'interface/icons/Cross';
import { WCLFight } from 'parser/core/Fight';
import * as React from 'react';

export type TimelineBarItem = {
  /** Timestamp to place the item */
  timestamp: number;
  /** SpellIcon to represent the item */
  icon: Spell;
  // TODO add option to overlay a symbol like an 'X' over the icon
  /** Tooltip to show on mousing over the item */
  tooltip?: React.ReactNode | string;
};

/**
 * Generates a timeline bar over the course of the fight upon which items can be dropped.
 * These items could represent casts, buffs, hits, etc.. and will have the appearance of
 * a spell icon with an optional symbol overlaid on top and an optional tooltip on mouseover.
 *
 * For example, this component could be used to display every time the player used a specific spell,
 * and the overlay icon and tooltip could show if the cast was 'good' or 'bad'
 *
 * @param fight the fight we're rendering, used for placing timestamp boundaries
 * @param items a list of items to render on the bar
 * @param label a label for this timeline that will appear on the left
 */
export function fightTimelineBar(
  fight: WCLFight,
  items: TimelineBarItem[],
  label: React.ReactNode,
): React.ReactNode {
  return (
    <div className="timeline-bar-container">
      <div className="bar-label">{label}</div>
      <TimelineBar items={items} start={fight.start_time} end={fight.end_time} />
    </div>
  );
}

type Props = {
  items: TimelineBarItem[];
  start: number;
  end: number;
};

const TimelineBar = ({ items, start, end, ...others }: Props) => {
  const duration = end - start;
  return (
    <div className="timeline-bar" {...others}>
      {items.map((item) =>
        item.tooltip !== undefined ? (
          <Tooltip key={`${item.timestamp}`} content={item.tooltip}>
            <div style={{ left: `${((item.timestamp - start) / duration) * 100}%` }}>
              <Cross />
              <SpellIcon id={item.icon.id} noLink />
            </div>
          </Tooltip>
        ) : (
          <div
            key={`${item.timestamp}`}
            style={{ left: `${((item.timestamp - start) / duration) * 100}%` }}
          >
            <SpellIcon id={item.icon.id} noLink />
          </div>
        ),
      )}
    </div>
  );
};

export default TimelineBar;
