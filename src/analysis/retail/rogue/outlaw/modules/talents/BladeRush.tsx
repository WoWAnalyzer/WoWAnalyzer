import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';

class BladeRush extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLADE_RUSH_TALENT);
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
    if (this.spellUsable.isOnCooldown(TALENTS.BLADE_RUSH_TALENT.id)) {
      const cooldownRemaining = this.spellUsable.cooldownRemaining(TALENTS.BLADE_RUSH_TALENT.id);
      const extraCDR = this.selectedCombatant.hasBuff(SPELLS.TRUE_BEARING.id) ? cpCost * 1000 : 0;
      const cooldownReduction = cpCost * 1000 + extraCDR;
      const newChargeCDR = cooldownRemaining - cooldownReduction;
      if (newChargeCDR < 0) {
        this.spellUsable.endCooldown(TALENTS.BLADE_RUSH_TALENT.id);
      } else {
        this.spellUsable.reduceCooldown(
          TALENTS.BLADE_RUSH_TALENT.id,
          cooldownReduction,
          event.timestamp,
        );
      }
    }
  }
}

export default BladeRush;
