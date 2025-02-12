import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import Events, { CastEvent, DamageEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import SpellUsable from '../core/SpellUsable';
import { EnhancementEventLinks } from '../../constants';

const UNRELENTING_STORMS_COOLDOWN_REDUCTION_PERCENTAGE = 0.4;

class UnrelentingStorms extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.UNRELENTING_STORMS_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CRASH_LIGHTNING_TALENT),
      this.onCrashLightningCast,
    );
  }

  onCrashLightningCast(event: CastEvent) {
    const relatedEvents = GetRelatedEvents<DamageEvent>(
      event,
      EnhancementEventLinks.CRASH_LIGHTNING_LINK,
      (e) => e.type === EventType.Damage,
    );
    if (relatedEvents.length === 1) {
      const currentCooldown = this.deps.spellUsable.fullCooldownDuration(
        TALENTS.CRASH_LIGHTNING_TALENT.id,
      );
      this.deps.spellUsable.reduceCooldown(
        TALENTS.CRASH_LIGHTNING_TALENT.id,
        currentCooldown * UNRELENTING_STORMS_COOLDOWN_REDUCTION_PERCENTAGE,
        event.timestamp,
      );
    }
  }
}

export default UnrelentingStorms;
