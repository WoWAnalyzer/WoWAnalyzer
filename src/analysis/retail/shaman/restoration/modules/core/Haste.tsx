import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DeathEvent, SummonEvent } from 'parser/core/Events';
import CoreHaste from 'parser/shared/modules/Haste';

const PREEMINENCE_HASTE = 0.25;

class Haste extends CoreHaste {
  override hasteBuffOverrides = this.selectedCombatant.hasTalent(TALENTS.PREEMINENCE_TALENT)
    ? { [SPELLS.ASCENDANCE_RESTORATION_BUFF.id]: PREEMINENCE_HASTE }
    : {};

  private activeTotem?: { id: number; instance?: number };

  constructor(options: Options) {
    super(options);
    if (
      this.selectedCombatant.hasTalent(TALENTS.PREEMINENCE_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS.HEALING_TIDE_TOTEM_TALENT)
    ) {
      this.addEventListener(
        Events.summon.by(SELECTED_PLAYER).spell(SPELLS.HEALING_TIDE_TOTEM),
        this.onTotemSummon,
      );
      this.addEventListener(Events.death.to(SELECTED_PLAYER_PET), this.onPetDeath);
    }
  }

  private onTotemSummon(event: SummonEvent) {
    if (this.activeTotem) {
      this._applyHasteLoss(event, PREEMINENCE_HASTE);
    }
    this.activeTotem = { id: event.targetID, instance: event.targetInstance };
    this._applyHasteGain(event, PREEMINENCE_HASTE);
  }

  private onPetDeath(event: DeathEvent) {
    if (
      this.activeTotem?.id === event.targetID &&
      this.activeTotem.instance === event.targetInstance
    ) {
      this.activeTotem = undefined;
      this._applyHasteLoss(event, PREEMINENCE_HASTE);
    }
  }
}

export default Haste;
