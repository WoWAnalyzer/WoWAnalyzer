import type { JSX } from 'react';
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
import { TALENTS_DRUID } from 'common/TALENTS';

const SOLAR_ECLIPSE_COLOR = '#8F5D00';
const LUNAR_ECLIPSE_COLOR = '#3C3C8A';
const CA_COLOR = '#006661';

/**
 * **Eclipse**
 * Spec Talent
 *
 * Active ability (32 sec cooldown, 15 sec duration). Empowers either Nature or Arcane spells.
 * Casting Wrath primes Solar Eclipse; casting Starfire primes Lunar Eclipse.
 * Both modes share a button and cooldown.
 *
 * Eclipse (Solar)
 * Nature spells deal 15% additional damage and Wrath damage is increased by 40%.
 *
 * Eclipse (Lunar)
 * Arcane spells deal 15% additional damage and Starfire damage is increased by 40%.
 */
export default class Eclipse extends Analyzer {
  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <SpellLink spell={TALENTS_DRUID.ECLIPSE_TALENT} /> has a 32-second cooldown, lasts 15
          seconds, and dramatically increases your damage. Cast it as often as possible, while
          making sure you have enough resources beforehand and you align it with other Cooldowns (if
          possible).
        </p>
        <p>
          {' '}
          It is important to choose the correct Eclipse:
          <ul>
            <li>
              3+ stacked targets → <SpellLink spell={SPELLS.ECLIPSE_LUNAR} />
            </li>
            <li>
              1 to 2 targets → <SpellLink spell={SPELLS.ECLIPSE_SOLAR} />
            </li>
          </ul>
        </p>
        {this.selectedCombatant.hasTalent(TALENTS_DRUID.LUNAR_CALLING_TALENT) && (
          <p>
            <strong>
              <SpellLink spell={TALENTS_DRUID.LUNAR_CALLING_TALENT} /> talented:{' '}
            </strong>
            This talent restricts you from casting <SpellLink spell={SPELLS.ECLIPSE_SOLAR} />
          </p>
        )}
        {!this.selectedCombatant.hasTalent(TALENTS_DRUID.LUNAR_CALLING_TALENT) && (
          <p>
            Your last filler cast determines which Eclipse you enter:
            <ul>
              <li>
                <SpellLink spell={SPELLS.WRATH} /> (single target) →{' '}
                <SpellLink spell={SPELLS.ECLIPSE_SOLAR} />
              </li>
              <li>
                <SpellLink spell={SPELLS.STARFIRE} /> (cleave) →{' '}
                <SpellLink spell={SPELLS.ECLIPSE_LUNAR} />
              </li>
            </ul>
          </p>
        )}
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <div>
            <strong>Eclipse uptimes</strong> -{' '}
            <Highlight color={SOLAR_ECLIPSE_COLOR} textColor="white">
              Solar
            </Highlight>{' '}
            <Highlight color={LUNAR_ECLIPSE_COLOR} textColor="white">
              Lunar
            </Highlight>{' '}
            <Highlight color={CA_COLOR} textColor="white">
              Both (Celestial Alignment)
            </Highlight>
          </div>
          {this.uptimeBar}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  private mapWithColor(uptimes: TrackedBuffEvent[], customColor: string): Uptime[] {
    return uptimes.map((uptime) => ({
      start: uptime.start,
      end: uptime.end !== null ? uptime.end : this.owner.currentTimestamp,
      customColor,
    }));
  }

  private get uptimeBar() {
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
              <SpellIcon spell={TALENTS_DRUID.ECLIPSE_TALENT} />{' '}
            </span>
            {formatPercentage(percentUptime, 0)}% <small>uptime</small>
          </div>
          <div className="flex-main chart">
            <UptimeBar
              uptimeHistory={allUptimes}
              start={this.owner.fight.start_time}
              end={this.owner.fight.end_time}
              timeTooltip={true}
            />
          </div>
        </div>
      </div>
    );
  }
}
