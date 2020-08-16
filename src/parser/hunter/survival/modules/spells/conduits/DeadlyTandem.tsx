import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import Events, { ApplyBuffEvent, CastEvent, FightEndEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import { COORDINATED_ASSAULT_BASELINE_DURATION, DEADLY_TANDEM_CA_DURATION_INCREASE } from 'parser/hunter/survival/constants';

class DeadlyTandem extends Analyzer {

  conduitRank: number = 0;
  increasedCAUptime: number = 0;
  caApplicationTimestamp: number = this.owner.fight.start_time;
  casts: number = 0;

  constructor(options: any) {
    super(options);
    this.active = false;
    if (!this.active) {
      return;
    }

    this.conduitRank = 1; //TODO: Find out the proper way of parsing conduit ranks

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COORDINATED_ASSAULT), this.onCACast);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.COORDINATED_ASSAULT), this.onCARemove);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.COORDINATED_ASSAULT), this.onCARefresh);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.COORDINATED_ASSAULT), this.onCAApply);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onGenericDamage);
  }

  onGenericDamage() {
    if (this.casts !== 0) {
      return;
    }
    if (this.selectedCombatant.hasBuff(SPELLS.COORDINATED_ASSAULT.id)) {
      this.casts += 1;
    }
  }

  onCACast(event: CastEvent) {
    this.casts += 1;
  }

  onCAApply(event: ApplyBuffEvent) {
    this.caApplicationTimestamp = event.timestamp;
  }

  onCARemove(event: RemoveBuffEvent) {
    this.increasedCAUptime += DEADLY_TANDEM_CA_DURATION_INCREASE[this.conduitRank];
  }

  onCARefresh(event: RefreshBuffEvent) {
    this.increasedCAUptime += Math.min(event.timestamp - this.caApplicationTimestamp, DEADLY_TANDEM_CA_DURATION_INCREASE[this.conduitRank]);
    this.caApplicationTimestamp = event.timestamp;
  }

  onFightEnd(event: FightEndEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.COORDINATED_ASSAULT.id)) {
      return;
    }
    if (event.timestamp - this.caApplicationTimestamp > COORDINATED_ASSAULT_BASELINE_DURATION) {
      this.increasedCAUptime += Math.min(event.timestamp - this.caApplicationTimestamp, DEADLY_TANDEM_CA_DURATION_INCREASE[this.conduitRank]);
    }
  }

  get maximumAddedCoordinatedAssaultUptime() {
    return this.casts * DEADLY_TANDEM_CA_DURATION_INCREASE[this.conduitRank];
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={(
          <>
            This doesn't account for any added Bird of Prey uptime that was enabled due to Coordinated Assault baseline having a longer duration.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.DEADLY_TANDOM_CONDUIT}>
          <>
            {formatNumber(this.increasedCAUptime / 1000)}/{this.maximumAddedCoordinatedAssaultUptime / 1000}s <small>increased Coordinated Assault uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default DeadlyTandem;
