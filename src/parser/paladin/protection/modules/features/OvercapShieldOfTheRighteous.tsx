import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import React from 'react';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';
import { formatNumber } from 'common/format';
import SpellLink from 'common/SpellLink';
import Abilities from 'parser/paladin/protection/modules/Abilities';
import SpellUsable from 'parser/paladin/protection/modules/features/SpellUsable';
import { TrackedBuffEvent } from 'parser/core/Entity';

const ACTIVE_MITIGATION_CAP = 13.5 * 1000; // Active mitigation buffs cap out at 13.5 seconds.
const SOTR_BUFF_LENGTH = 4.5 * 1000; // SOTR grants a 4.5s buff.
const SOTR_SOFT_CAP = ACTIVE_MITIGATION_CAP - SOTR_BUFF_LENGTH;
const SECOND = 1000;

class OvercapShieldOfTheRighteous extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  goodSotrCasts: number = 0;
  badSotrCasts: number = 0;
  totalSotrOvercapping: number = 0;
  lastSotrCastTimestamp: number = 0;
  numSotrCasts: number = 0;
  sotrCasts: CastEvent[] = [];
  sotrCastToBuffTimeAtCast: Map<number, number> = new Map<number, number>();

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
    this.numSotrCasts += 1;
    this.sotrCasts.push(event);
    if (this.sotrCastToBuffTimeAtCast.size === 0) {
      this.sotrCastToBuffTimeAtCast.set(event.timestamp, 0);
    } else {
      const diffBetweenSotRCasts = event.timestamp - this.lastSotrCastTimestamp;
      const buffTimeAtLastCast = (this.sotrCastToBuffTimeAtCast.get(this.lastSotrCastTimestamp) || 0);
      const currentBuffUptime = Math.max(Math.min(SOTR_BUFF_LENGTH - diffBetweenSotRCasts + buffTimeAtLastCast, ACTIVE_MITIGATION_CAP), 0);
      console.log(`Calculated ${currentBuffUptime} as ${SOTR_BUFF_LENGTH} - ${diffBetweenSotRCasts} + ${buffTimeAtLastCast}.`);
      this.sotrCastToBuffTimeAtCast.set(event.timestamp, currentBuffUptime);
    }
    this.lastSotrCastTimestamp = event.timestamp;
  }

  getSotrOvercapAmount(event: CastEvent): number {
    if (!this.selectedCombatant.hasBuff(SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF.id, event.timestamp)) {
      return 0;
    } else if (this.castIsForgivable(event)) {
      return 0;
    } else {
      const currentBufftime = this.getCurrentSotrBuffTime(event);
      console.log(`Found current SOTR buff time of ${currentBufftime} at timestamp ${event.timestamp}.`);
      return Math.min(Math.max(0, currentBufftime + SOTR_BUFF_LENGTH - SOTR_SOFT_CAP), SOTR_BUFF_LENGTH);
    }
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

  getCurrentSotrBuffTime(event: CastEvent): number {
    return (this.sotrCastToBuffTimeAtCast.get(event.timestamp) || 0);
  }

  statistic(): React.ReactNode {
    const idealSotrUptime = this.numSotrCasts * SOTR_BUFF_LENGTH;
    const actualSotrUptime = this.selectedCombatant.getBuffUptime(SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF.id);
    const lostUptimeDueToOvercap = idealSotrUptime - actualSotrUptime;
    let overcapSum: number = 0;
    this.sotrCasts.forEach((cast) => {
      const overcapAmount = this.getSotrOvercapAmount(cast);
      console.log(`Found overcap amount of ${overcapAmount} for SOTR cast at timestamp ${cast.timestamp}.`);
      overcapSum += overcapAmount;
    });
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
