import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import Events, { EndChannelEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

// DGB gives AT LEAST 20% of the 60s back.
const MINIMUM_CDR = 0.2 * 60000;

export default class DarkglareBoon extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.DARKGLARE_BOON_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.EndChannel.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT),
      this.onFelDevastationCast,
    );
  }

  onFelDevastationCast(event: EndChannelEvent) {
    this.spellUsable.reduceCooldown(
      TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT.id,
      MINIMUM_CDR,
      event.timestamp,
    );
  }
}
