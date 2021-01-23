import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import React from 'react';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import { formatMilliseconds, formatNumber } from 'common/format';
import { SpellLink } from 'interface';
import SpellUsable from 'parser/paladin/protection/modules/features/SpellUsable';

const ACTIVE_MITIGATION_CAP = 13.5 * 1000; // Active mitigation buffs cap out at 13.5 seconds.
const SOTR_BUFF_LENGTH = 4.5 * 1000; // SOTR grants a 4.5s buff.
const SOTR_SOFT_CAP = ACTIVE_MITIGATION_CAP - SOTR_BUFF_LENGTH;
const SECOND = 1000;
const debug = false;

type OvercapRecord = {cast: CastEvent, overcap: number};

class OvercapShieldOfTheRighteous extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  goodSotrCasts: number = 0;
  badSotrCasts: number = 0;
  totalSotrOvercapping: number = 0;
  lastSotrCastTimestamp: number = 0;
  buffTimeAtLastCast: number = 0;
  overcapRecords: OvercapRecord[] = [];

  hpGeneratingSpells = [
    SPELLS.BLESSED_HAMMER_TALENT,
    SPELLS.HAMMER_OF_THE_RIGHTEOUS,
    SPELLS.HAMMER_OF_WRATH,
    SPELLS.JUDGMENT_CAST_PROTECTION,
  ];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_OF_THE_RIGHTEOUS), this.trackSotRCasts);
  }

  trackSotRCasts(event: CastEvent): void {
    if (this.lastSotrCastTimestamp === 0) {
      this.goodSotrCasts += 1;
      this.lastSotrCastTimestamp = event.timestamp;
      this.buffTimeAtLastCast = SOTR_BUFF_LENGTH;
      return;
    }
    const timeDiffBetweenCasts = event.timestamp - this.lastSotrCastTimestamp;
    const buffAmountAtCurrentCast = Math.max(0, this.buffTimeAtLastCast - timeDiffBetweenCasts);
    if (buffAmountAtCurrentCast >= SOTR_SOFT_CAP && !this.castIsForgivable(event)) {
      this.badSotrCasts += 1;
      this.overcapRecords.push({
        cast:event,
        overcap: ACTIVE_MITIGATION_CAP - buffAmountAtCurrentCast,
      });
      debug && console.log(`Determined cast at ${event.timestamp} is bad cast with buff amount of ${buffAmountAtCurrentCast}. Adding overcap amount of ${ACTIVE_MITIGATION_CAP - buffAmountAtCurrentCast}`);
    } else {
      this.goodSotrCasts += 1;
      debug && console.log(`Determined cast at ${event.timestamp} is good cast with buff amount of ${buffAmountAtCurrentCast}.`);
    }
    this.lastSotrCastTimestamp = event.timestamp;
    this.buffTimeAtLastCast = Math.min(buffAmountAtCurrentCast + SOTR_BUFF_LENGTH, ACTIVE_MITIGATION_CAP);
  }

  /**
   * Determine if a cast of SotR is "forgivable" despite buff overcapping.
   * A cast is determined to be forgivable if using abilities other than SotR
   * would result in Holy Power overcapping otherwise.
   * @param event
   */
  castIsForgivable(event: CastEvent): boolean {
    for (let i = 0; i < this.hpGeneratingSpells.length; i++) {
      if (this.spellUsable.isAvailable(this.hpGeneratingSpells[i].id)) {
        return false;
      }
    }
    return true;
  }

  statistic(): React.ReactNode {
    const idealSotrUptime = (this.goodSotrCasts + this.badSotrCasts) * SOTR_BUFF_LENGTH;
    const actualSotrUptime = this.selectedCombatant.getBuffUptime(SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF.id);
    const lostUptimeDueToOvercap = idealSotrUptime - actualSotrUptime;
    return (
      <>
        <Statistic
          position={STATISTIC_ORDER.DEFAULT}
          size="flexible"
          category={STATISTIC_CATEGORY.GENERAL}
          tooltip={(
            <>
              You lost {formatNumber(lostUptimeDueToOvercap/SECOND)} seconds due to overcapping <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} />.<br />
              Overcapping occurs when you cast <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> with more than {formatNumber(SOTR_SOFT_CAP/SECOND)} seconds left on the buff.
            </>
          )}
          dropdown={(
            <>
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <th>Cast Timestamp</th>
                    <th>Overcap Amount (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {this.overcapRecords.map((record: OvercapRecord, i: number) => (
                    <tr key={i}>
                      <td>{this.owner.formatTimestamp(record.cast.timestamp)}</td>
                      <td>{formatMilliseconds(record.overcap)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        >
          <BoringSpellValue spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS}
            value={`${formatNumber(lostUptimeDueToOvercap/SECOND)}s`}
            label="Uptime lost to overcapping"
          />
        </Statistic>
      </>
    );
  }
}

export default OvercapShieldOfTheRighteous;
