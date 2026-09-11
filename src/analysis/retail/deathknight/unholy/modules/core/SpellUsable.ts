import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbilityEvent, ApplyBuffEvent, EventType } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  private readonly putrefyMaxConsumesPerCast: number;

  constructor(options: Options) {
    super(options);
    this.putrefyMaxConsumesPerCast = this.selectedCombatant.hasTalent(TALENTS.PUTRID_ECHOES_TALENT)
      ? 2
      : 1;
    if (
      this.selectedCombatant.hasTalent(TALENTS.REAPING_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS.SOUL_REAPER_TALENT)
    ) {
      // The player buff identifies normal DT; Blightfall uses a separate reset path.
      this.addEventListener(
        Events.applybuff
          .by(SELECTED_PLAYER)
          .to(SELECTED_PLAYER)
          .spell(SPELLS.DARK_TRANSFORMATION_BUFF),
        this.onDarkTransformation,
      );
    }
  }

  private onDarkTransformation(event: ApplyBuffEvent) {
    this.endCooldown(TALENTS.SOUL_REAPER_TALENT.id, event.timestamp);
  }

  beginCooldown(
    triggeringEvent: AbilityEvent<EventType>,
    spellId: number = triggeringEvent.ability.guid,
  ) {
    if (spellId !== TALENTS.PUTREFY_TALENT.id) {
      super.beginCooldown(triggeringEvent, spellId);
      return;
    }

    const chargesToConsume = Math.min(
      this.putrefyMaxConsumesPerCast,
      this.chargesAvailable(spellId),
    );

    for (let i = 0; i < chargesToConsume; i += 1) {
      super.beginCooldown(triggeringEvent, spellId);
    }
  }
}

export default SpellUsable;
