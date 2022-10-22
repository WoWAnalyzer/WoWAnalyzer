import { formatPercentage } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import { SpellIcon } from 'interface';
import { WCLFight } from 'parser/core/Fight';
import UptimeBar, { Uptime } from 'parser/ui/UptimeBar';
import * as React from 'react';
import './UptimeBarSubStatistic.scss';

/** Specifies what should be rendered in the uptime bar */
export type UptimeBarSpec = {
  /** Title spell or spells */
  spells: Spell[];
  /** Uptime periods to render */
  uptimes: Uptime[];
  /** Color to render the bars, in format '#rrggbb'. If omitted, UptimeBar's default color will be used. */
  color?: string;
};

export enum SubPercentageStyle {
  ABSOLUTE = 'absolute',
  RELATIVE = 'relative',
}

/**
 * A JSX element with a primary 'uptime bar' over the course of an encounter and optionally
 * one or more smaller sub bars.
 * @param fight the fight we're rendering, used for placing timestamp boundaries
 * @param primaryBar a spec for the primary uptime bar to display
 * @param subBars specs for the sub-bars to display underneath it -
 *   if omitted, will have no sub bars
 * @param subPercentageStyle
 *   iff 'absolute', sub bar uptime percent will be the portion of the entire fight's time,
 *   iff 'relative', sub bar uptime percent will be the portion of primary uptime.
 *   For example, if a fight had a duration of 1000, the primary uptime was 500,
 *   and the sub uptime was 200, with 'absolute' the relative uptime will be listed as 20%
 *   and with 'relative' it will be listed as 40%
 *
 */
export default function uptimeBarSubStatistic(
  fight: Pick<WCLFight, 'start_time' | 'end_time'>,
  primaryBar: UptimeBarSpec,
  subBars: UptimeBarSpec[] = [],
  subPercentageStyle: SubPercentageStyle = SubPercentageStyle.RELATIVE,
): React.ReactNode {
  const primaryUptime = getCombinedUptime(primaryBar.uptimes);
  const totalFightTime = fight.end_time - fight.start_time;
  const subBarUptimeReference =
    subPercentageStyle === SubPercentageStyle.ABSOLUTE ? totalFightTime : primaryUptime;
  return (
    <div className="flex-main multi-uptime-bar">
      <div className="flex main-bar">
        <div className="flex-sub bar-label">
          {getSubUptimeIcon(primaryBar)}
          {formatPercentUptime(primaryUptime, totalFightTime)} <small>uptime</small>
        </div>
        <div className="flex-main chart">
          <UptimeBar
            timeTooltip
            uptimeHistory={primaryBar.uptimes}
            start={fight.start_time}
            end={fight.end_time}
            barColor={primaryBar.color}
          />
        </div>
      </div>
      {subBars.map((spec) => (
        <div key={spec.spells[0].name} className="flex sub-bar">
          <div className="flex-sub bar-label" style={{ color: spec.color }}>
            {getSubUptimeIcon(spec)}{' '}
            {formatPercentUptime(getCombinedUptime(spec.uptimes), subBarUptimeReference)}
          </div>
          <div className="flex-main chart">
            <UptimeBar
              timeTooltip
              uptimeHistory={spec.uptimes}
              start={fight.start_time}
              end={fight.end_time}
              barColor={spec.color}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function getCombinedUptime(uptimes: Uptime[]): number {
  return uptimes.reduce((acc, up) => acc + up.end - up.start, 0);
}

function formatPercentUptime(uptime: number, total: number): string {
  return formatPercentage(uptime / total, 0) + '%';
}

function getSubUptimeIcon(spec: UptimeBarSpec) {
  return spec.spells.map((s) => (
    <>
      <SpellIcon key={'Icon-' + s.name} id={s.id} />{' '}
    </>
  ));
}
