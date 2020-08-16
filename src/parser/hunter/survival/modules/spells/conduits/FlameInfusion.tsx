import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import { AFFECTED_BY_GUERRILLA_TACTICS, FLAME_INFUSION_WFB_DAMAGE_INCREASE } from 'parser/hunter/survival/constants';
import SPELLS from 'common/SPELLS';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';

class FlameInfusion extends Analyzer {

  conduitRank: number = 0;
  addedDamage: number = 0;
  flameInfusionStacks: number = 0;
  spentStacks: number = 0;
  potentialStacks: number = 0;

  constructor(options: any) {
    super(options);
    this.active = false;
    if (!this.active) {
      return;
    }

    this.conduitRank = 1; //TODO: Find out the proper way of parsing conduit ranks

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(AFFECTED_BY_GUERRILLA_TACTICS), this.onBombImpact);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this.onApplyFlameInfusion);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER), this.onApplyStackFlameInfusion);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER), this.onRemoveFlameInfusion);
  }

  onBombImpact(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.FLAME_INFUSION_BUFF.id)) {
      return;
    }
    this.addedDamage += calculateEffectiveDamage(event, FLAME_INFUSION_WFB_DAMAGE_INCREASE[this.conduitRank] * this.flameInfusionStacks);
    this.spentStacks += this.flameInfusionStacks;
  }

  onApplyFlameInfusion(event: ApplyBuffEvent) {
    this.potentialStacks += 1;
    this.flameInfusionStacks = currentStacks(event);
  }

  onApplyStackFlameInfusion(event: ApplyBuffStackEvent) {
    this.potentialStacks += 1;
    this.flameInfusionStacks = currentStacks(event);
  }

  onRemoveFlameInfusion(event: RemoveBuffEvent) {
    this.flameInfusionStacks = currentStacks(event);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.FLAME_INFUSION_CONDUIT}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default FlameInfusion;
