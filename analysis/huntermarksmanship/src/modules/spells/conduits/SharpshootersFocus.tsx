import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';
import Events, { ApplyBuffEvent, FightEndEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { SHARPSHOOTERS_FOCUS_INCREASE_TRUESHOT_DURATION, TRUESHOT_DURATION_BASELINE } from '@wowanalyzer/hunter-marksmanship/src/constants';
import ConduitSpellText from 'parser/ui/ConduitSpellText';

/**
 * Trueshot lasts 20.0% longer.
 *
 * Example log
 *
 */
class SharpshootersFocus extends Analyzer {

  conduitRank: number = 0;
  increasedTrueshotUptime: number = 0;
  trueshotApplicationTimestamp: number = this.owner.fight.start_time;
  uptimeAddedBoolean: boolean = false;
  casts: number = 0;

  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.SHARPSHOOTERS_FOCUS_CONDUIT.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TRUESHOT), this.onTrueshotApply);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.TRUESHOT), this.onTrueshotRemove);
    this.addEventListener(Events.fightend.by(SELECTED_PLAYER).spell(SPELLS.TRUESHOT), this.onFightEnd);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TRUESHOT), this.onTrueshotRefresh);
  }

  get maximumAddedTrueshotUptime() {
    return this.casts * (TRUESHOT_DURATION_BASELINE * SHARPSHOOTERS_FOCUS_INCREASE_TRUESHOT_DURATION[this.conduitRank]);
  }

  onTrueshotApply(event: ApplyBuffEvent) {
    this.trueshotApplicationTimestamp = event.timestamp;
    this.uptimeAddedBoolean = false;
    this.casts += 1;
  }

  onTrueshotRemove(event: RemoveBuffEvent) {
    this.addTrueshotUptime(event);
    this.uptimeAddedBoolean = true;
    if (this.casts === 0) {
      this.casts += 1;
    }
  }

  onTrueshotRefresh(event: RefreshBuffEvent) {
    this.addTrueshotUptime(event);
    this.trueshotApplicationTimestamp = event.timestamp;
    this.uptimeAddedBoolean = false;
    this.casts += 1;
  }

  onFightEnd(event: FightEndEvent) {
    if (this.uptimeAddedBoolean) {
      return;
    }
    this.addTrueshotUptime(event);
  }

  addTrueshotUptime(event: RemoveBuffEvent | RefreshBuffEvent | FightEndEvent) {
    this.increasedTrueshotUptime += Math.max(event.timestamp - this.trueshotApplicationTimestamp - TRUESHOT_DURATION_BASELINE, 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={(
          <>
            You lost out on {((this.maximumAddedTrueshotUptime - this.increasedTrueshotUptime) / 1000).toFixed(1)}s of increased uptime due to combat ending or refreshing Trueshot.
          </>
        )}
      >
        <ConduitSpellText spell={SPELLS.SHARPSHOOTERS_FOCUS_CONDUIT} rank={this.conduitRank}>
          <>
            {(this.increasedTrueshotUptime / 1000).toFixed(1)}s <small>increased Trueshot uptime</small>
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }

}

export default SharpshootersFocus;
