import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import StatTracker from 'parser/core/modules/StatTracker';
import SPELLS from 'common/SPELLS';
import DualStatisticBox from 'interface/others/DualStatisticBox';
import SpellIcon from 'common/SpellIcon';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

import Atonement from '../spells/Atonement';
import isAtonement from '../core/isAtonement';
import AtonementDamageSource from '../features/AtonementDamageSource';
import AtonementApplicationSource from '../features/AtonementApplicationSource';

/**
 * The healing bonus on Enduring is technically a boost to PWR healing
 * As such it's 40% stronger than the tooltip due to that
 */
const HEALING_MULTIPLIER = 1.4;

class EnduringLuminescence extends Analyzer {
  static bonusDuration = 1500;
  atonementBonusHealing = 0;
  castBonusHealing = 0;

  static dependencies = {
    atonementDamageSource: AtonementDamageSource,
    atonementApplicationSource: AtonementApplicationSource,
    statTracker: StatTracker,
    atonement: Atonement,
  };

  constructor(...args) {
    super(...args);

    this.ranks =
      this.selectedCombatant.traitRanks(SPELLS.ENDURING_LUMINESCENCE.id) || [];
    this.bonusHealing =
      this.ranks
        .map(rank =>
          calculateAzeriteEffects(SPELLS.ENDURING_LUMINESCENCE.id, rank)
        )
        .reduce((total, bonus) => total + bonus, 0) * HEALING_MULTIPLIER;

    this.active = this.ranks.length > 0;
  }

  on_byPlayer_heal(event) {
    this.handlePWRBonus(event);
    this.handleAtonementBonus(event);
  }

  handlePWRBonus(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.POWER_WORD_RADIANCE.id) return;

    let eventHealing = this.bonusHealing;
    let eventOverhealing = 0;

    if (event.overheal) {
      eventOverhealing = Math.min(this.bonusHealing, event.overheal);
      eventHealing -= eventOverhealing;
    }

    this.castBonusHealing += eventHealing;
  }

  handleAtonementBonus(event) {
    // Atonement portion
    const target = this.atonement.currentAtonementTargets.find(
      id => id.target === event.targetID
    );
    if (!target) return;
    if (!target.isEnduringEmpowered) return;
    if (
      event.timestamp <
      target.atonementExpirationTimestamp - EnduringLuminescence.bonusDuration
    )
      {return;}

    if (isAtonement(event)) {
      this.atonementBonusHealing += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    return (
      <DualStatisticBox
        footer="PWR HPS is from the healing bonus."
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
        position={STATISTIC_ORDER.OPTIONAL()}
        icon={
          (
<SpellIcon
  id={SPELLS.ENDURING_LUMINESCENCE.id}
  ilvl={this.ranks[0]}
          />
)
        }
        values={[
          `${formatNumber(
            (this.atonementBonusHealing / this.owner.fightDuration) * 1000
          )} HPS`,
          `${formatNumber(
            (this.castBonusHealing / this.owner.fightDuration) * 1000
          )} PWR HPS`,
        ]}
      />
    );
  }
}

export default EnduringLuminescence;
