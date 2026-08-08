/**
 * For 8 sec after casting Nature's Swiftness or Ancestral Swiftness, the recharge rate of Riptide is increased by 10%.
 */

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/shaman';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { MYSTIC_KNOWLEDGE_CD_REDUCTION } from 'src/analysis/retail/shaman/restoration/constants';

export default class MysticKnowledge extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MYSTIC_KNOWLEDGE_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.MYSTIC_KNOWLEDGE_TALENT),
      this.onApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.MYSTIC_KNOWLEDGE_TALENT),
      this.onRemove,
    );
  }

  onApply(event: ApplyBuffEvent) {
    this.spellUsable.applyCooldownRateChange(
      TALENTS.RIPTIDE_TALENT.id,
      MYSTIC_KNOWLEDGE_CD_REDUCTION,
      event.timestamp,
    );
  }

  onRemove(event: RemoveBuffEvent) {
    this.spellUsable.removeCooldownRateChange(
      TALENTS.RIPTIDE_TALENT.id,
      MYSTIC_KNOWLEDGE_CD_REDUCTION,
      event.timestamp,
    );
  }
}
