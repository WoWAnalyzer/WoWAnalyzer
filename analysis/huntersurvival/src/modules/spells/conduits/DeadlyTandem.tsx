import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';
import Events, { ApplyBuffEvent, CastEvent, FightEndEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import { COORDINATED_ASSAULT_BASELINE_DURATION, DEADLY_TANDEM_CA_DURATION_INCREASE } from '@wowanalyzer/hunter-survival/src/constants';
import ConduitSpellText from 'parser/ui/ConduitSpellText';

/**
 * Coordinated Assault's duration is increased by x ms
 *
 * Example log
 *
 */
class DeadlyTandem extends Analyzer {

  conduitRank: number = 0;
  increasedCAUptime: number = 0;
  caApplicationTimestamp: number = this.owner.fight.start_time;
  casts: number = 0;

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.DEADLY_TANDOM_CONDUIT.id);

    if (!this.conduitRank) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COORDINATED_ASSAULT), this.onCACast);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.COORDINATED_ASSAULT), this.onCARemove);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.COORDINATED_ASSAULT), this.onCARefresh);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.COORDINATED_ASSAULT), this.onCAApply);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onGenericDamage);
  }

  get maximumAddedCoordinatedAssaultUptime() {
    return this.casts * DEADLY_TANDEM_CA_DURATION_INCREASE[this.conduitRank];
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
        <ConduitSpellText spell={SPELLS.DEADLY_TANDOM_CONDUIT} rank={this.conduitRank}>
          <>
            {formatNumber(this.increasedCAUptime / 1000)}/{this.maximumAddedCoordinatedAssaultUptime / 1000}s <small>increased Coordinated Assault uptime</small>
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }

}

export default DeadlyTandem;
