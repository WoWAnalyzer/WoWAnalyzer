import React from 'react';
import LucidDreamsHealers from 'parser/shared/modules/spells/bfa/essences/LucidDreamsHealers';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';

import StatIcon from 'interface/icons/PrimaryStat';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import ItemManaGained from 'interface/others/ItemManaGained';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import StatisticGroup from 'interface/statistics/StatisticGroup';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { TooltipElement } from 'common/Tooltip';
import Rejuvenation from 'parser/druid/restoration/modules/core/Rejuvenation';
import StatTracker from 'parser/shared/modules/StatTracker';
import Abilities from 'parser/core/modules/Abilities';

class LucidDreamsRestoDruid extends LucidDreamsHealers {
  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
    rejuvenation: Rejuvenation,
  };

  _getManaSavedHealing(mana) {
    return (mana / SPELLS.REJUVENATION.manaCost) * this.rejuvenation.avgRejuvHealing;
  }

  statistic() {
    const rank = this.selectedCombatant.essenceRank(SPELLS.LUCID_DREAMS.traitId);
    return (
      <StatisticGroup category={STATISTIC_CATEGORY.ITEMS}>
        <ItemStatistic ultrawide size="flexible">
          <div className="pad">
            <label><SpellLink id={SPELLS.LUCID_DREAMS.id} /> - Minor Rank {rank}</label>
            <div className="value">
              <ItemHealingDone amount={this.healing} /><br />
              <TooltipElement content={<>Assuming mana used to fill with Rejuvs: <strong>≈{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this._getManaSavedHealing(this.manaRestoredMinor)))}%</strong> healing)</>}>
                <ItemManaGained amount={this.manaRestoredMinor} /><br />
              </TooltipElement>
              {rank > 2 && (<><StatIcon stat={"versatility"} /> {formatNumber(this.minorBuffUptime * this.versGain)} <small>average versatility gained</small><br /></>)}
            </div>
          </div>
        </ItemStatistic>
        {this.hasMajor && (
          <ItemStatistic ultrawide>
            <div className="pad">
              <label><SpellLink id={SPELLS.LUCID_DREAMS.id} /> - Major Rank {rank}</label>
              <div className="value">
                <TooltipElement content={<>Does not take into account if you used Lucid Dreams while you were capped on mana. Assuming mana used to fill with Rejuvs: <strong>≈{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this._getManaSavedHealing(this.manaRestoredMajor)))}%</strong> healing)</>}>
                  <ItemManaGained amount={this.manaRestoredMajor} /><br />
                </TooltipElement>
                {rank > 2 && (<><StatIcon stat={"leech"} /> {formatNumber(this.majorBuffUptime * this.leechGain)} <small>average leech gained</small><br /></>)}
              </div>
            </div>
          </ItemStatistic>
        )}
      </StatisticGroup>
    );
  }
}

export default LucidDreamsRestoDruid;
