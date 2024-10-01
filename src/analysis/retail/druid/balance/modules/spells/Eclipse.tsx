import Analyzer from 'parser/core/Analyzer';
import { SpellIcon, SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TrackedBuffEvent } from 'parser/core/Entity';
import { cdSpell } from 'analysis/retail/druid/balance/constants';
import UptimeBar, { Uptime } from 'parser/ui/UptimeBar';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { mergeTimePeriods } from 'parser/core/mergeTimePeriods';
import { Highlight } from 'interface/Highlight';

const SOLAR_ECLIPSE_COLOR = '#bb9922';
const LUNAR_ECLIPSE_COLOR = '#1111cc';
const CA_COLOR = '#11bbbb';

/**
 * **Eclipse**
 * Spec Talent
 *
 * Casting 2 Starfire empowers Wrath for 15 sec. Casting 2 Wrath empowers Starfire for 15 sec.
 *
 * Eclipse (Solar)
 * Nature spells deal 15% additional damage and Wrath damage is increased by 40%.
 *
 * Eclipse (Lunar)
 * Arcane spells deal 15% additional damage and the damage Starfire deals to nearby enemies is increased by 30%.
 */
export default class Eclipse extends Analyzer {
  mapWithColor(uptimes: TrackedBuffEvent[], customColor: string): Uptime[] {
    return uptimes.map((uptime) => ({
      start: uptime.start,
      end: uptime.end !== null ? uptime.end : this.owner.currentTimestamp,
      customColor,
    }));
  }

  get uptimeBar() {
    const solarEclipseUptimes = this.mapWithColor(
      this.selectedCombatant.getBuffHistory(SPELLS.ECLIPSE_SOLAR.id),
      SOLAR_ECLIPSE_COLOR,
    );
    const lunarEclipseUptimes = this.mapWithColor(
      this.selectedCombatant.getBuffHistory(SPELLS.ECLIPSE_LUNAR.id),
      LUNAR_ECLIPSE_COLOR,
    );
    const caUptimes = this.mapWithColor(
      this.selectedCombatant.getBuffHistory(cdSpell(this.selectedCombatant).id),
      CA_COLOR,
    );
    const allUptimes = solarEclipseUptimes.concat(lunarEclipseUptimes).concat(caUptimes);

    const combinedUptime = mergeTimePeriods(allUptimes, this.owner.fight.end_time).reduce(
      (acc, up) => acc + up.end - up.start,
      0,
    );
    const totalFightTime = this.owner.fight.end_time - this.owner.fight.start_time;
    const percentUptime = combinedUptime / totalFightTime;

    return (
      <div className="flex-main multi-uptime-bar">
        <div className="flex main-bar">
          <div className="flex-sub bar-label">
            <span>
              <SpellIcon spell={SPELLS.ECLIPSE} />{' '}
            </span>
            {formatPercentage(percentUptime, 0)}% <small>uptime</small>
          </div>
          <div className="flex-main chart">
            <UptimeBar
              uptimeHistory={allUptimes}
              start={this.owner.fight.start_time}
              end={this.owner.fight.end_time}
            />
          </div>
        </div>
      </div>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={SPELLS.ECLIPSE} />
          </strong>{' '}
          dramatically increases your damage while active - when it fades you should immediately
          reactivate it.
        </p>
        <p>
          It's best to enter <SpellLink spell={SPELLS.ECLIPSE_LUNAR} /> when you can hit 3 or more
          stacked targets with <SpellLink spell={SPELLS.STARFIRE} />, and best to enter{' '}
          <SpellLink spell={SPELLS.ECLIPSE_SOLAR} /> otherwise.
        </p>
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <div>
            <strong>Eclipse uptimes</strong> -{' '}
            <Highlight color={SOLAR_ECLIPSE_COLOR} textColor="black">
              Solar
            </Highlight>{' '}
            <Highlight color={LUNAR_ECLIPSE_COLOR} textColor="white">
              Lunar
            </Highlight>{' '}
            <Highlight color={CA_COLOR} textColor="black">
              Both (Celestial Alignment)
            </Highlight>
          </div>
          {this.uptimeBar}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}
