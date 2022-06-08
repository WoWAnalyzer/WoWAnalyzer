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
  // TODO add overlay modifier like an X or other symbol?
  /** Tooltip to show on mousing over the item */
  tooltip?: React.ReactNode | string;
};

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
