import { CastEvent, EventType, FilterCooldownInfoEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from '../../spell-list_Monk_Brewmaster.retail';
import HighTolerance from '../spells/HighTolerance';
import SPELLS_COMMON from 'common/SPELLS';

export default class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    highTolerance: HighTolerance,
  };

  private highTolerance!: HighTolerance;

  protected onCast(event: CastEvent | FilterCooldownInfoEvent): void {
    if (
      event.type === EventType.Cast &&
      event.ability.guid === SPELLS.PURIFYING_BREW_TALENT.id &&
      this.selectedCombatant.hasBuff(SPELLS_COMMON.ELEVATED_STAGGER_BUFF.id)
    ) {
      this.highTolerance.reducePurifyCooldown(event, this);
    }

    super.onCast(event);
  }
}
