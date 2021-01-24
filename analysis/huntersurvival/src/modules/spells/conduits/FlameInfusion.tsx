import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import { AFFECTED_BY_GUERRILLA_TACTICS, FLAME_INFUSION_WFB_DAMAGE_INCREASE } from '@wowanalyzer/hunter-survival/src/constants';
import SPELLS from 'common/SPELLS';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import React from 'react';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import ConduitSpellText from 'parser/ui/ConduitSpellText';

/**
 * Carve/Butchery increases the damage of your next Wildfire Bomb explosion by 10.0%, stacks up to 2 times.
 *
 * Example log
 *
 */
class FlameInfusion extends Analyzer {

  conduitRank: number = 0;
  addedDamage: number = 0;
  flameInfusionStacks: number = 0;
  spentStacks: number = 0;
  potentialStacks: number = 0;

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.FLAME_INFUSION_CONDUIT.id);

    if (!this.conduitRank) {
      this.active = false;
      return;
    }

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
        <ConduitSpellText spell={SPELLS.FLAME_INFUSION_CONDUIT} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }

}

export default FlameInfusion;
