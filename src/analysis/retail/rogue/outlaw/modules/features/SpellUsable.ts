import Events, { ApplyBuffEvent, CastEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import { TALENTS_ROGUE } from 'common/TALENTS/rogue';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

// Crack Shot talent gives Between The Eyes no cooldown whilst in stealth
// Also resets the cooldown when entering stealth
class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_ROGUE.CRACKSHOT_TALENT);

    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.STEALTH_BUFF, SPELLS.VANISH_BUFF, SPELLS.SUBTERFUGE_BUFF]),
      this.onStealth,
    );
  }

  private onStealth(event: ApplyBuffEvent) {
    super.endCooldown(SPELLS.BETWEEN_THE_EYES.id, event.timestamp);
  }

  beginCooldown(cooldownTriggerEvent: CastEvent, _spellId: number) {
    const spellId = cooldownTriggerEvent.ability.guid;

    if (
      spellId === SPELLS.BETWEEN_THE_EYES.id &&
      (this.selectedCombatant.hasBuff(SPELLS.SUBTERFUGE_BUFF) ||
        this.selectedCombatant.hasBuff(SPELLS.STEALTH_BUFF))
    ) {
      return;
    }

    super.beginCooldown(cooldownTriggerEvent, spellId);
  }
}

export default SpellUsable;
