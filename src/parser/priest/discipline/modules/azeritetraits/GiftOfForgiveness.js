import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';
import SPELLS from 'common/SPELLS';
import Enemies from 'parser/shared/modules/Enemies';
import DualStatisticBox from 'interface/others/DualStatisticBox';
import SpellIcon from 'common/SpellIcon';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

import { SmiteEstimation } from '../../SpellCalculations';
import SinsOfTheMany from '../spells/SinsOfTheMany';
import Atonement from '../spells/Atonement';
import isAtonement from '../core/isAtonement';
import AtonementDamageSource from '../features/AtonementDamageSource';

class GiftOfForgiveness extends Analyzer {
  static dependencies = {
    atonementDamageSource: AtonementDamageSource,
    statTracker: StatTracker,
    atonement: Atonement,
    sins: SinsOfTheMany,
    enemies: Enemies,
  };

  smites;
  gifted;
  giftedDamage;
  smiteEstimation;

  constructor(...args) {
    super(...args);

    // always active, to display the "potential"
    this.active = true;

    this.giftRanks = this.selectedCombatant.traitRanks(SPELLS.GIFT_OF_FORGIVENESS.id) || [];
    this.giftTooltipBonusDmg = this.giftRanks.map((rank) => calculateAzeriteEffects(SPELLS.GIFT_OF_FORGIVENESS.id, rank)[0]).reduce((total, bonus) => total + bonus[0], 0);

    this.hasGift = this.giftRanks.length > 0;

    this.smites = 0;
    this.gifted = 0;
    this.giftedDamage = 0;
    this.giftedHealing = 0;

    this.smiteEstimation = SmiteEstimation(this.statTracker, this.sins, this.giftRanks);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SMITE.id) {
      this.smites++;

      if (this.atonement.giftActive) {
        this.gifted++;

        const { smiteDamage, giftDamage } = this.smiteEstimation(this.atonement.giftActive);

        // use smite damage estimation to take into account multipliers that are applied to gift too (because it's base damage increase)
        //  and multiply based on event.amount / smiteDamage to take into account external multipliers (schism, debuffs, buffs, etc) and crits
        this.giftedDamage += (giftDamage * (event.amount / smiteDamage));
      }
    }
  }

  on_byPlayer_heal(event) {
    if (!isAtonement(event)) {
      return;
    }

    const atonenementDamageEvent = this.atonementDamageSource.event;
    if (!atonenementDamageEvent) {
      this.error('Atonement damage event unknown for Atonement heal:', event);
      return;
    }

    const spellId = atonenementDamageEvent.ability.guid;

    if (spellId === SPELLS.SMITE.id) {
      if (this.atonement.giftActive) {

        const { giftHealing } = this.smiteEstimation(this.atonement.giftActive);

        // use smite damage estimation to take into account multipliers that are applied to gift too (because it's base damage increase)
        //  and multiply based on event.amount / smiteDamage to take into account external multipliers and crits
        let giftedHealing = (giftHealing * (event.amount / giftHealing));

        // any overhealing means the trait didn't do much for us
        giftedHealing -= event.overheal;

        if (giftedHealing > 0) {
          this.giftedHealing += giftedHealing;
        }
      }
    }
  }

  statistic() {
    if (this.hasGift) {
      // to make the tooltip reflect multiple ranks of the trait we use a bit of a hacky way to figure out which ilvl would result in displaying the sum of the bonus damage
      let ilvl = 0;
      if (this.giftRanks.length === 1) {
        ilvl = this.giftRanks[0];
      } else {
        let ilvlDmgBonus = calculateAzeriteEffects(SPELLS.GIFT_OF_FORGIVENESS.id, this.giftRanks[0])[0];
        for (ilvl = this.giftRanks[0]; ilvlDmgBonus < this.giftTooltipBonusDmg; ilvl++) {
          ilvlDmgBonus = calculateAzeriteEffects(SPELLS.GIFT_OF_FORGIVENESS.id, ilvl)[0];
        }
      }

      return (
        <DualStatisticBox
          category={STATISTIC_CATEGORY.AZERITE_POWERS}
          position={STATISTIC_ORDER.OPTIONAL()}
          icon={<SpellIcon id={SPELLS.GIFT_OF_FORGIVENESS.id} ilvl={ilvl} />}
          values={[
            `${formatNumber(
              (this.giftedHealing / this.owner.fightDuration) * 1000
            )} HPS`,
            `${formatNumber(
              ((this.giftedDamage) / this.owner.fightDuration) * 1000
            )} DPS`,
          ]}
          footer={(
            <dfn
              data-tip={`You casted Smite ${this.smites} times, out of which ${this.gifted} you had 3+ atonements up.`}
            >
              {this.gifted} Gifted Smites
            </dfn>
          )}
        />
      );
    } else {

      return (
        <TraitStatisticBox
          position={STATISTIC_ORDER.OPTIONAL()}
          trait={SPELLS.GIFT_OF_FORGIVENESS.id}
          value={`No Gift Traits`}
          label={
            (
              <dfn
                data-tip={`You casted Smite ${this.smites} times, out of which ${this.gifted} you had 3+ atonements up.`}
              >
                {this.gifted} Potentially Gifted Smites
              </dfn>
            )
          }
        />
      );
    }
  }
}

export default GiftOfForgiveness;
