import React from 'react';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { BuffEvent, DamageEvent } from 'parser/core/Events';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import ResourceGenerated from 'interface/others/ResourceGenerated';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const HOT_HAND = {
  INCREASE: 1.0,
  COST_REDUCTION: SPELLS.LAVA_LASH.maelstrom,
};

class HotHand extends Analyzer {

  /**
   * Melee attacks with Flametongue active have a chance to make your next
   * Lava Lash cost no Maelstrom and deal 100% increased damage.
   *
   * Example Log:
   *
   */

  protected damageGained = 0;
  protected maelstromSaved = 0;
  protected hotHandCount = 0;
  protected hotHandUses = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HOT_HAND_TALENT.id);

    this.addEventListener(
      Events.applybuff.spell(SPELLS.LANDSLIDE_BUFF),
      this.onHotHandBuff,
    );

    this.addEventListener(
      Events.refreshbuff.spell(SPELLS.LANDSLIDE_BUFF),
      this.onHotHandBuff,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(SPELLS.LAVA_LASH),
      this.onLavaLashDamage,
    );
  }

  onHotHandBuff(event: BuffEvent) {
    this.hotHandCount += 1;
  }

  onLavaLashDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.HOT_HAND_BUFF.id)) {
      return;
    }

    this.hotHandUses += 1;
    this.damageGained += calculateEffectiveDamage(event, HOT_HAND.INCREASE);
    this.maelstromSaved += HOT_HAND.COST_REDUCTION;
  }

  // TODO: add uses/count to statistics
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={'TALENTS'}
      >
        <BoringSpellValueText spell={SPELLS.HOT_HAND_TALENT}>
          <>
            <ItemDamageDone amount={this.damageGained} /><br />
            <ResourceGenerated amount={this.maelstromSaved} resourceType={RESOURCE_TYPES.MAELSTROM} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HotHand;
