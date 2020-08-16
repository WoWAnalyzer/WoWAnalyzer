import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import Events, { ApplyBuffEvent, FightEndEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import { SHARPSHOOTERS_FOCUS_INCREASE_TRUESHOT_DURATION, TRUESHOT_DURATION_BASELINE } from 'parser/hunter/marksmanship/constants';
import { formatNumber } from 'common/format';

class SharpshootersFocus extends Analyzer {

  conduitRank: number = 0;
  increasedTrueshotUptime: number = 0;
  trueshotApplicationTimestamp: number = this.owner.fight.start_time;
  uptimeAddedBoolean: boolean = false;
  casts: number = 0;

  constructor(options: any) {
    super(options);
    this.active = false;
    if (!this.active) {
      return;
    }

    this.conduitRank = 1; //TODO: Find out the proper way of parsing conduit ranks

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TRUESHOT), this.onTrueshotApply);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.TRUESHOT), this.onTrueshotRemove);
    this.addEventListener(Events.fightend.by(SELECTED_PLAYER).spell(SPELLS.TRUESHOT), this.onFightEnd);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TRUESHOT), this.onTrueshotRefresh);
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

  get maximumAddedTrueshotUptime() {
    return this.casts * (TRUESHOT_DURATION_BASELINE * SHARPSHOOTERS_FOCUS_INCREASE_TRUESHOT_DURATION[this.conduitRank]);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.SHARPSHOOTERS_FOCUS_CONDUIT}>
          <>
            {formatNumber(this.increasedTrueshotUptime / 1000)}/{this.maximumAddedTrueshotUptime / 1000}s <small>increased Trueshot uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default SharpshootersFocus;
