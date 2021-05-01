import { formatMilliseconds } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

const ADRENALINE_RUSH_NORMAL_MS = 20_000;
const ADRENALINE_RUSH_CELERITY_MS = 3000;
const TIMESTAMP_BUFFER_MS = 50;

const debug = false;

interface LostUptime {
  cast: CastEvent;
  lostBuff: number;
}

/**
 * Analyzer for the Outlaw Rogue legendary Celerity.
 * "Adrenaline Rush increases your damage by 8%, and you have a chance while Slice and Dice is
 * active to gain the Adrenaline Rush effect for 3 sec."
 * Casting Adrenaline Rush while it is already active due to Celerity will cause
 * the duration to refresh rather than being extended.
 */
class Celerity extends Analyzer {
  lostUptimes: LostUptime[] = [];
  numAdrenalineRushCasts: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.CELERITY.bonusID);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ADRENALINE_RUSH),
      this.onAdrenalineRushCast,
    );
  }

  onAdrenalineRushCast(event: CastEvent) {
    this.numAdrenalineRushCasts += 1;
    if (
      this.selectedCombatant.hasBuff(
        SPELLS.ADRENALINE_RUSH.id,
        event.timestamp - TIMESTAMP_BUFFER_MS,
      )
    ) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = (
        <>
          You cast <SpellLink id={SPELLS.ADRENALINE_RUSH.id} /> when it was already active from{' '}
          <SpellLink id={SPELLS.CELERITY.id} />. This causes{' '}
          <SpellLink id={SPELLS.ADRENALINE_RUSH.id} /> to refresh duration rather than increase,
          resulting in lost uptime.
        </>
      );
      const remainingARTime = this.selectedCombatant.getRemainingBuffTimeAtTimestamp(
        SPELLS.ADRENALINE_RUSH.id,
        ADRENALINE_RUSH_CELERITY_MS,
        ADRENALINE_RUSH_CELERITY_MS,
        event.timestamp,
      );
      const loss: LostUptime = {
        cast: event,
        lostBuff: ADRENALINE_RUSH_NORMAL_MS - (ADRENALINE_RUSH_CELERITY_MS - remainingARTime),
      };
      debug && console.log(`Recorded bad AR cast with remaining uptime of ${remainingARTime}.`);
      debug && console.dir(loss);
      this.lostUptimes.push(loss);
    }
  }

  statistic(): React.ReactNode {
    const tableEntries: React.ReactNode[] = [];
    this.lostUptimes.forEach((loss: LostUptime, idx: number) => {
      tableEntries.push(
        <>
          <tr key={idx}>
            <td>{this.owner.formatTimestamp(loss.cast.timestamp)}</td>
            <td>{formatMilliseconds(loss.lostBuff)}</td>
          </tr>
        </>,
      );
    });

    let tooltip: React.ReactElement | null;
    if (this.lostUptimes.length === 0) {
      tooltip = (
        <>
          You used <SpellLink id={SPELLS.CELERITY.id} /> without losing any uptime on{' '}
          <SpellLink id={SPELLS.ADRENALINE_RUSH.id} />. Great job!
        </>
      );
    } else {
      tooltip = (
        <>
          You used {this.lostUptimes.length} casts of <SpellLink id={SPELLS.ADRENALINE_RUSH.id} />{' '}
          incorrectly with <SpellLink id={SPELLS.CELERITY.id} />.
        </>
      );
    }
    let dropdown: React.ReactElement | null = null;
    if (this.lostUptimes.length !== 0) {
      dropdown = (
        <>
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Cast Timestamp</th>
                <th>Lost Uptime</th>
              </tr>
            </thead>
            <tbody>{tableEntries}</tbody>
          </table>
        </>
      );
    }

    return (
      <>
        <Statistic
          position={STATISTIC_ORDER.DEFAULT}
          size="flexible"
          category={STATISTIC_CATEGORY.ITEMS}
          tooltip={tooltip}
          dropdown={dropdown}
        >
          <BoringSpellValue
            spell={SPELLS.CELERITY}
            value={`${this.lostUptimes.length}/${this.numAdrenalineRushCasts}`}
            label="Bad Casts of Adrenaline Rush with Celerity Legendary"
          />
        </Statistic>
      </>
    );
  }
}

export default Celerity;
