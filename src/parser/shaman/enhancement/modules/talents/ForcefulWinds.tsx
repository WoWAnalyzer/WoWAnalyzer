import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent, EnergizeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import ResourceGenerated from 'interface/others/ResourceGenerated';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const FORCEFUL_WINDS = {
  INCREASE: 1,
  BASE_MAELSTROM: 5,
};

/**
 * Windfury causes each successive Windfury attack within 15s to increase
 * the damage of Windfury by 80% Attack Power and the Maelstrom generated
 * by 1, stacking up to 5 times.
 */
class ForcefulWinds extends Analyzer {
  protected damageGained: number = 0;
  protected maelstromGained: number = 0;

  constructor(options: any) {
    super(options);

    if(!this.selectedCombatant.hasTalent(SPELLS.FORCEFUL_WINDS_TALENT.id)) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(SPELLS.WINDFURY_ATTACK),
      this.onDamage,
    );
    this.addEventListener(
      Events.energize.by(SELECTED_PLAYER)
        .spell(SPELLS.MAELSTROM_WEAPON),
      this.onEnergize,
    );
  }

  onDamage(event: DamageEvent) {
    const buff: any = this.selectedCombatant.getBuff(SPELLS.FORCEFUL_WINDS_BUFF.id);
    if (!buff) {
      return;
    }
    const stacks = buff.stacks || 0;
    this.damageGained += calculateEffectiveDamage(
      event,
      stacks * FORCEFUL_WINDS.INCREASE,
    );
  }

  onEnergize(event: EnergizeEvent) {
    this.maelstromGained += event.resourceChange - FORCEFUL_WINDS.BASE_MAELSTROM;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.FORCEFUL_WINDS_TALENT}>
          <>
            <ItemDamageDone amount={this.damageGained} /><br />
            <ResourceGenerated amount={this.maelstromGained} resourceType={RESOURCE_TYPES.MAELSTROM} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ForcefulWinds;
