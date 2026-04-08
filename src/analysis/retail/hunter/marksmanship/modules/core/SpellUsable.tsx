import TALENTS from 'common/TALENTS/hunter';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  lastPotentialTriggerForRapidFireReset: CastEvent | DamageEvent | null = null;
  rapidFireResets = 0;

  constructor(options: Options) {
    super(options);
    if (this.selectedCombatant.hasTalent(TALENTS.SURGING_SHOTS_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.AIMED_SHOT_TALENT),
        this.onAimedShotCast,
      );
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(TALENTS.AIMED_SHOT_TALENT),
        this.onAimedShotDamage,
      );
    }
  }

  onAimedShotCast(event: CastEvent) {
    this.lastPotentialTriggerForRapidFireReset = event;
  }

  onAimedShotDamage(event: DamageEvent) {
    this.lastPotentialTriggerForRapidFireReset = event;
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (
      spellId === TALENTS.RAPID_FIRE_TALENT.id &&
      this.selectedCombatant.hasTalent(TALENTS.SURGING_SHOTS_TALENT)
    ) {
      if (this.isOnCooldown(spellId)) {
        this.rapidFireResets += 1;
        this.endCooldown(
          spellId,
          this.lastPotentialTriggerForRapidFireReset
            ? this.lastPotentialTriggerForRapidFireReset.timestamp
            : undefined,
        );
        this.lastPotentialTriggerForRapidFireReset = null;
      }
    }
    super.onCast(event);
  }

  beginCooldown(triggerEvent: CastEvent | DamageEvent, spellId: number) {
    super.beginCooldown(triggerEvent, spellId);
  }
}

export default SpellUsable;
