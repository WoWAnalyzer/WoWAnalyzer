import { SpellIcon } from 'interface';
import { formatPercentage } from 'common/format';
import UptimeBar, { Uptime } from 'parser/ui/UptimeBar';
import React from 'react';

/**
 * Returns a JSX element that displays an 'uptime bar' over the course of an encounter.
 */
// TODO more options like bar color?
export default function uptimeBarSubStatistic(spellId: number, totalUptime: number, uptimes: Uptime[]) {
  return (
    <div className="flex">
      <div className="flex-sub icon">
        <SpellIcon id={spellId} />
      </div>
      <div className="flex-sub value" style={{ width: 140 }}>
        {formatPercentage(totalUptime, 0)}% <small>uptime</small>
      </div>
      <div className="flex-main chart" style={{ padding: 15 }}>
        <UptimeBar
          uptimeHistory={uptimes}
          start={this.owner.fight.start_time}
          end={this.owner.fight.end_time}
        />
      </div>
    </div>
  );
}
