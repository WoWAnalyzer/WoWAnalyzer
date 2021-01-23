import React from 'react';

import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';

import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';

import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

import { conduitScaling } from '../../../mistweaver/constants';

class ImbuedReflections extends Analyzer {
  boost = 0;

  healing = 0;
  damage = 0;

  cloneIDs = new Set();

  /**
   * Increase damage and healing by fallen order by x%
   */
  constructor(...args) {
    super(...args);
    const conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.IMBUED_REFLECTIONS.id);
    if (!conduitRank) {
      this.active = false;
      return;
    }

    this.boost = conduitScaling(.3625, conduitRank);

    //summon events (need to track this to get melees)
    this.addEventListener(Events.summon.by(SELECTED_PLAYER).spell([SPELLS.FALLEN_ORDER_OX_CLONE, SPELLS.FALLEN_ORDER_TIGER_CLONE, SPELLS.FALLEN_ORDER_CRANE_CLONE]), this.trackSummons);

    //mistweaver spells
    this.addEventListener(Events.heal.by(SELECTED_PLAYER_PET).spell([SPELLS.FALLEN_ORDER_ENVELOPING_MIST, SPELLS.FALLEN_ORDER_SOOTHING_MIST]), this.normalizeHealingBoost);
    //brewmaster spells
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell([SPELLS.FALLEN_ORDER_KEG_SMASH, SPELLS.FALLEN_ORDER_BREATH_OF_FIRE, SPELLS.BREATH_OF_FIRE_DEBUFF]), this.normalizeDamageBoost);
    //windwalker spells
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell([SPELLS.FALLEN_ORDER_SPINNING_CRANE_KICK, SPELLS.FISTS_OF_FURY_DAMAGE]), this.normalizeDamageBoost);
    //shared
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.MELEE), this.handleMelee);
  }

  trackSummons(event) {
    this.cloneIDs.add(event.targetID);
  }

  normalizeHealingBoost(event) {
    this.healing += calculateEffectiveHealing(event, this.boost);
  }

  normalizeDamageBoost(event) {
    const damage = event.amount;
    const amount = (damage - damage / (1 + this.boost)) || 0;
    this.damage += amount;
  }

  handleMelee(event) {
    if (this.cloneIDs.has(event.sourceID)) {
      this.normalizeDamageBoost(event);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.IMBUED_REFLECTIONS}>
          <ItemHealingDone amount={this.healing} /><br />
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ImbuedReflections;
