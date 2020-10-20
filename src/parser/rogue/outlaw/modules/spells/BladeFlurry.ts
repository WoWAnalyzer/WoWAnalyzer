import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent } from 'parser/core/Events';
import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';

class BladeFlurry extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.DISPATCH, SPELLS.EVISCERATE, SPELLS.KIDNEY_SHOT, SPELLS.BETWEEN_THE_EYES, SPELLS.SLICE_AND_DICE]), this.onFinishMove);
  }

  onFinishMove(event: CastEvent) {
    if (!event.classResources || !getResource(event.classResources, RESOURCE_TYPES.COMBO_POINTS.id)) {
      return;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.BLADE_FLURRY.id)) {
      const cpCost = getResource(event.classResources, RESOURCE_TYPES.COMBO_POINTS.id)?.cost;
      if (cpCost) {
        const extraCDR = this.selectedCombatant.hasBuff(SPELLS.TRUE_BEARING.id) ? (cpCost * 1000) : 0;
        const cooldownReduction = (cpCost * 1000) + extraCDR;
        this.spellUsable.reduceCooldown(SPELLS.BLADE_FLURRY.id, cooldownReduction, event.timestamp);
      }      
    }
  }
}

export default BladeFlurry;
