import { formatNth, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RefreshBuffEvent } from 'parser/core/Events';
import { binomialCDF } from 'parser/shared/modules/helpers/Probability';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import HotAttributor from '../../core/hottracking/HotAttributor';

const PROC_PROB = 0.4;

/**
 * **Memory of the Mother Tree**
 * Runecarving Legendary
 *
 * Wild Growth has a 40% chance to cause your next Rejuvenation or Regrowth
 * to apply to 3 additional allies within 20 yards of the target.
 */
class MemoryoftheMotherTree extends Analyzer {
  static dependencies = {
    hotAttributor: HotAttributor,
  };

  hotAttributor!: HotAttributor;

  wgCasts = 0;
  procs = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.MEMORY_OF_THE_MOTHER_TREE.bonusID,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WILD_GROWTH),
      this.onCastWildGrowth,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MEMORY_OF_THE_MOTHER_TREE),
      this.onApplyMotmt,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MEMORY_OF_THE_MOTHER_TREE),
      this.onApplyMotmt,
    );
  }

  onCastWildGrowth(event: CastEvent) {
    this.wgCasts += 1;
  }

  onApplyMotmt(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (!event.prepull) {
      this.procs += 1;
    }
  }

  get procRate() {
    return this.wgCasts === 0 ? 0 : this.procs / this.wgCasts;
  }

  get procRatePercentile() {
    return binomialCDF(this.procs, this.wgCasts, PROC_PROB);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            This is the healing attributable to the rejuvenations and regrowths spawned by the
            Memory of the Mother Tree legendary. This amount includes the mastery benefit.
            <br />
            <br />
            You got <strong>{this.procs}</strong> procs over <strong>{this.wgCasts}</strong> casts,
            for a proc rate of <strong>{formatPercentage(this.procRate, 1)}%</strong>. This is a{' '}
            <strong>
              {formatNth(Number(formatPercentage(this.procRatePercentile, 0)))} percentile
            </strong>{' '}
            result.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.MEMORY_OF_THE_MOTHER_TREE.id}>
          <ItemPercentHealingDone amount={this.hotAttributor.memoryOfTheMotherTreeAttrib.healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MemoryoftheMotherTree;
