import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { CastEvent, DamageEvent } from '../../../../core/Events';

/**
 * Grants you and your pet 5 Focus per sec and 10% increased critical strike
 * chance for 20 sec. Reduces GCD by 200ms before haste.
 *
 * Example report: https://www.warcraftlogs.com/reports/gnM3RY6QWKwa2tGF#fight=18&type=damage-done&source=10
 */

class AspectOfTheWild extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  casts = 0;

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ASPECT_OF_THE_WILD.id) {
      return;
    }
    this.casts += 1;
    this.markCastAsInefficient(event);
  }

  on_byPlayer_damage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.ASPECT_OF_THE_WILD.id)) {
      return;
    }
    if (this.casts === 0) {
      this.casts += 1;
      this.spellUsable.beginCooldown(SPELLS.ASPECT_OF_THE_WILD.id, {
        timestamp: this.owner.fight.start_time,
      });
    }
  }

  markCastAsInefficient(event: CastEvent) {
    if (event.meta === undefined) {
      event.meta = {
        isInefficientCast: false,
        inefficientCastReason: '',
      };
    }
    const hasPrimalInstincts = this.selectedCombatant.hasTrait(SPELLS.PRIMAL_INSTINCTS.id);
    const hasTwoBarbedStacks = this.spellUsable.chargesAvailable(SPELLS.BARBED_SHOT.id) === 2;

    if (hasPrimalInstincts && hasTwoBarbedStacks) {
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason
        = 'Aspect of the Wild was cast while having two charges of Barbed Shot and using Primal Instincts.';
      return;
    }
  }
}

export default AspectOfTheWild;
