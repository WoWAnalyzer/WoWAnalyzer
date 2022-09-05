import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class BladeRush extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLADE_RUSH_TALENT.id);
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.DISPATCH,
          SPELLS.EVISCERATE,
          SPELLS.KIDNEY_SHOT,
          SPELLS.BETWEEN_THE_EYES,
          SPELLS.SLICE_AND_DICE,
        ]),
      this.onFinishMove,
    );
  }

  onFinishMove(event: CastEvent) {
    const cpCost = getResource(event.classResources, RESOURCE_TYPES.COMBO_POINTS.id)?.cost;
    if (!cpCost) {
      return;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.BLADE_RUSH_TALENT.id)) {
      const cooldownRemaining = this.spellUsable.cooldownRemaining(SPELLS.BLADE_RUSH_TALENT.id);
      const extraCDR = this.selectedCombatant.hasBuff(SPELLS.TRUE_BEARING.id) ? cpCost * 1000 : 0;
      const cooldownReduction = cpCost * 1000 + extraCDR;
      const newChargeCDR = cooldownRemaining - cooldownReduction;
      if (newChargeCDR < 0) {
        this.spellUsable.endCooldown(SPELLS.BLADE_RUSH_TALENT.id);
      } else {
        this.spellUsable.reduceCooldown(
          SPELLS.BLADE_RUSH_TALENT.id,
          cooldownReduction,
          event.timestamp,
        );
      }
    }
  }
}

export default BladeRush;
