import { formatPercentage } from 'common/format';
import { SpellIcon } from 'interface';
import { WCLFight } from 'parser/core/Fight';
import UptimeBar, { Uptime } from 'parser/ui/UptimeBar';
import React from 'react';
import Spell from 'common/SPELLS/Spell';

/**
 * Returns a JSX element that displays an 'uptime bar' over the course of an encounter.
 */
export default function uptimeBarSubStatistic(
  fight: WCLFight,
  spell: Spell,
  uptimes: Uptime[],
  subUptimes: SubUptimes[] = [],
): React.ReactNode {
  const dotUptime = getCombinedUptime(uptimes);
  return (
    <div className="flex">
      <div className="flex-sub icon">
        <SpellIcon id={spell.id} />
      </div>
      <div className="flex-main">
        <div className="flex" style={{ padding: 3 }}>
          <div className="flex-sub value" style={{ width: 150 }}>
            {formatPercentUptime(dotUptime, fight.end_time - fight.start_time)} <small>uptime</small>
          </div>
          <div className="flex-main chart">
            <UptimeBar uptimeHistory={uptimes} start={fight.start_time} end={fight.end_time} />
          </div>
        </div>
        {subUptimes.map((su) => {
          return (
            <div key={su.spell.id} className="flex" style={{ padding: 3, height: 15 }}>
              <div className="flex-sub value" style={{ width: 150, color: su.color, fontSize: '14px' }}>
                <SpellIcon id={su.spell.id} /> {formatPercentUptime(getCombinedUptime(su.uptimes), dotUptime)}
              </div>
              <div className="flex-main chart">
                <UptimeBar
                  uptimeHistory={su.uptimes}
                  start={fight.start_time}
                  end={fight.end_time}
                  barColor={su.color}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getCombinedUptime(uptimes: Uptime[]): number {
  return uptimes.reduce((acc, up) => acc + up.end - up.start, 0);
}

function formatPercentUptime (uptime: number, total: number): string {
  return formatPercentage(uptime / total, 0) + '%';
}

export type SubUptimes = {
  uptimes: Uptime[];
  color: string; // TODO diff type?
  spell: Spell;
};
