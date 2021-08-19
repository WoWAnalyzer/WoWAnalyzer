import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  DamageEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { BUTCHERS_BONE_FRAGMENTS_DMG_AMP } from '@wowanalyzer/hunter-survival/src/constants';

/**
 * Mongoose Bite and Raptor Strike increases the damage of your next Butchery or Carve by 20%, stacking up to 6 times.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/6JBKFWcQ8mk1rTC3#fight=1&type=summary&source=2&translate=true
 */

class ButchersBoneFragments extends Analyzer {
  stacks = 0;
  damage = 0;
  spellKnown = this.selectedCombatant.hasTalent(SPELLS.BUTCHERY_TALENT.id)
    ? SPELLS.BUTCHERY_TALENT
    : SPELLS.CARVE;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.BUTCHERS_BONE_FRAGMENTS_EFFECT.bonusID,
    );
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BUTCHERS_BONE_FRAGMENTS_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BUTCHERS_BONE_FRAGMENTS_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.BUTCHERS_BONE_FRAGMENTS_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.CARVE, SPELLS.BUTCHERY_TALENT]),
      this.onDamage,
    );
  }

  handleStacks(event: ApplyBuffEvent | ApplyBuffStackEvent | RemoveBuffEvent) {
    this.stacks = currentStacks(event);
  }

  onDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, this.stacks * BUTCHERS_BONE_FRAGMENTS_DMG_AMP);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spellId={SPELLS.BUTCHERS_BONE_FRAGMENTS_EFFECT.id}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ButchersBoneFragments;
