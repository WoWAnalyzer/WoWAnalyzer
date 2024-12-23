import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { RemoveBuffEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

/**
 * Consuming Killing Machine reduces the cooldown of Frostscythe by 1.0 sec.
 */
const FROSTSCYTHE_COOLDOWN_REDUCTION_MS = 1000;

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
  };

  lastCritTime: number = -2000;
  hasFrostscythe: boolean;

  constructor(options: Options) {
    super(options);
    this.hasFrostscythe = this.selectedCombatant.hasTalent(talents.FROSTSCYTHE_TALENT);

    if (!this.hasFrostscythe) {
      return;
    }

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.KILLING_MACHINE),
      this.onKmConsume,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.KILLING_MACHINE),
      this.onKmConsume,
    );
  }

  onKmConsume(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    this.reduceCooldown(talents.FROSTSCYTHE_TALENT.id, FROSTSCYTHE_COOLDOWN_REDUCTION_MS);
  }
}

export default SpellUsable;
