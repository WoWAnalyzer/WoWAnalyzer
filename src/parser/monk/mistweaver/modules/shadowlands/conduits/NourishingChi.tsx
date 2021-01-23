import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';

import ItemHealingDone from 'parser/ui/ItemHealingDone';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';

import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { conduitScaling, LIFE_COCOON_HEALING_BOOST, NOURISHING_CHI_RANK_ONE } from '../../../constants';

/**
 * HoT Healing during Life cocoon is buffed by x% and this boost lasts for an extra 6 second after cocoon breaks or ends.
 * As an FYI from what it looks like is the boost directly effects the Life cocoon buff so we have to reverse math it for while life coocon is up
 * Then after cocoon fades/breaks the normal buff goes on them
 */
class NourishingChi extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  healing: number = 0;
  boost: number = 0;
  conduitRank: number = 0;
  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.NOURISHING_CHI.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }

    this.boost = conduitScaling(NOURISHING_CHI_RANK_ONE, this.conduitRank);
    this.addEventListener(Events.heal, this.heal);
  }

  heal(event: HealEvent) {
    //Life Cocoon works on any HoT that has this flag checked even if they don't come from the mistweaver themselves
    if (!event.tick) {
      return;
    }

    const target = this.combatants.players[event.targetID];

    if (!target) {
      return;
    }

    if (target.hasBuff(SPELLS.LIFE_COCOON.id, event.timestamp, 0, 0)) {
      // idea
      // heal = boostedHeal / (1.5 + x)
      // bonusHeal = heal * x
      const boostedHeal = (event.amount || 0) + (event.absorbed || 0) + (event.overheal || 0);
      const heal = boostedHeal / (1 + LIFE_COCOON_HEALING_BOOST + this.boost);
      const bonusHeal = heal * this.boost;
      const effectiveHealing = Math.max(0, (bonusHeal - (event.overheal || 0)));
      this.healing += effectiveHealing;
    }

    if (target.hasBuff(SPELLS.NOURISHING_CHI_BUFF.id, event.timestamp, 0, 0)) {
      this.healing += calculateEffectiveHealing(event, this.boost);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.NOURISHING_CHI}>
          <ItemHealingDone amount={this.healing} /><br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default NourishingChi;
