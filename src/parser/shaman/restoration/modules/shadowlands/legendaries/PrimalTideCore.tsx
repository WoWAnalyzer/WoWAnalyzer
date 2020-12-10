import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, CastEvent, HasTarget, HealEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/ItemHealingDone';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';

// I have observed massive delays of the copied application
// the linked log has
// Cast Success:  0:21:634
// Buff Apply:    0:21:965
// which is a delay of 331ms.
// Manual testing shows delays of up to (at least) 700ms,
// which is caused by primordial having travel time.
// So this is just not gonna check for a time buffer.
// Possible issues: traveling slower than the current GCD
// which could fuck up the tracking if the next cast is a Riptide.

/**
 * Every 4 casts of Riptide also applies Riptide to another friendly target near your Riptide target.
 * https://www.warcraftlogs.com/reports/94XrMGFh3vaN8dDZ/#fight=12&source=205
 */
class PrimalTideCore extends Analyzer {
  healing = 0;
  overhealing = 0;
  targetsWithBoostedRiptides: boolean[] = [];

  castEvent: CastEvent | null = null;
  gainedRiptideCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.PRIMAL_TIDE_CORE.bonusID);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.RIPTIDE, SPELLS.PRIMORDIAL_WAVE_CAST]), this.castedRiptide);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RIPTIDE), this.trackRiptide);
    // we figured out it can never refresh a riptide
    // this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.RIPTIDE), this.trackRiptide);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RIPTIDE), this.riptideHeal);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RIPTIDE), this.removeRiptide);
  }

  castedRiptide(event: CastEvent) {
    this.castEvent = event;
  }

  // this relies on castevent coming 1st which does not actually happen every time
  // should reorder that as well
  trackRiptide(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (!HasTarget(event)) {
      return;
    }
    // We want the application that we **didn't** target,
    // as that means its our copied Riptide.
    if (this.castEvent && this.castEvent.targetID !== event.targetID) {
      this.gainedRiptideCasts -= -1;
      this.targetsWithBoostedRiptides[event.targetID] = true;
      this.castEvent = null;
    } else {
      delete this.targetsWithBoostedRiptides[event.targetID];
    }
  }

  riptideHeal(event: HealEvent) {
    if (this.targetsWithBoostedRiptides[event.targetID]) {
      this.healing += event.amount + (event.absorbed || 0);
      this.overhealing += (event.overheal || 0);
    }
  }

  removeRiptide(event: RemoveBuffEvent) {
    delete this.targetsWithBoostedRiptides[event.targetID];
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={<>
          <Trans id="shaman.restoration.legendaries.primalTideCore.statistic.tooltip">{this.gainedRiptideCasts} Riptide applications</Trans><br />
          <Trans id="shaman.restoration.legendaries.primalTideCore.statistic.tooltip2">{formatPercentage(this.overhealing / (this.healing + this.overhealing))}% Overhealing</Trans>
        </>}
      >
        <BoringSpellValueText spell={SPELLS.PRIMAL_TIDE_CORE}>
          <ItemHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PrimalTideCore;
